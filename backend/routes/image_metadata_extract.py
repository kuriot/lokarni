from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from PIL import Image
from io import BytesIO
import re
import json
import random
import requests

router = APIRouter()

# Example mappings for "random" values
PHOTO_TYPES = ["portrait", "landscape", "street photography", "fashion photography", "high fashion photography"]
LIGHTING_TYPES = ["natural light", "studio lighting", "dramatic lighting", "soft lighting"]
COMPOSITIONS = ["close-up shot", "full body shot", "medium shot", "wide angle"]
POSES = ["standing straight", "dynamic pose", "sitting", "walking"]
BACKGROUNDS = ["cityscape", "nature", "studio backdrop", "abstract background", "snowy landscape"]
PLACES = ["outdoor setting", "indoor studio", "urban environment", "natural environment"]
HAIRSTYLES = ["long hair", "short hair", "curly hair", "braids", "ponytail"]
PHOTOGRAPHY_STYLES = ["minimalist", "vibrant", "moody", "cinematic", "documentary"]
DEVICES = ["shot on Canon EOS R5", "shot on Nikon Z9", "shot on Panasonic Lumix S5 with Lumix S PRO 70-200mm f-2.8 O.I.S"]

# New request model for URLs
class ImageUrlRequest(BaseModel):
    url: str
    api_key: Optional[str] = None

def generate_prompt_from_generator(inputs: dict) -> str:
    """Generiert einen Prompt basierend auf PromptGenerator Inputs"""
    prompt_parts = []
    
    # Custom prompt first
    if inputs.get("custom") and inputs["custom"].strip():
        prompt_parts.append(inputs["custom"].strip())
    
    # Artform
    artform = inputs.get("artform", "")
    photo_type = inputs.get("photo_type", "")
    
    # If photo_type is "random", choose a random type
    if photo_type == "random":
        photo_type = random.choice(PHOTO_TYPES)
    
    if artform == "photography" and photo_type:
        prompt_parts.append(photo_type)
    elif artform and artform != "disabled":
        prompt_parts.append(artform)
    
    # Default tags (subject)
    if inputs.get("default_tags") and inputs["default_tags"] != "disabled":
        subject = inputs["default_tags"].strip()
        # Add hairstyle if enabled
        hairstyle = inputs.get("hairstyles", "")
        if hairstyle == "random":
            hairstyle = random.choice(HAIRSTYLES)
        if hairstyle and hairstyle != "disabled":
            subject += f" with (({hairstyle}))"
        prompt_parts.append(subject)
    
    # Place
    place = inputs.get("place", "")
    if place == "random":
        place = random.choice(PLACES)
    if place and place != "disabled":
        prompt_parts.append(place)
        # Additional details for certain locations
        if "outdoor" in place or "nature" in place:
            prompt_parts.extend(["pine trees", "daytime", "wooden structure"])
    
    # Background
    background = inputs.get("background", "")
    if background == "random":
        background = random.choice(BACKGROUNDS)
    if background and background != "disabled":
        prompt_parts.append(background)
    
    # Pose
    pose = inputs.get("pose", "")
    if pose == "random":
        pose = random.choice(POSES)
    if pose and pose != "disabled":
        prompt_parts.append(pose)
        if pose == "standing straight":
            prompt_parts.append("hands together")
        prompt_parts.append("slight smile")
    
    # Composition
    composition = inputs.get("composition", "")
    if composition == "random":
        composition = random.choice(COMPOSITIONS)
    if composition and composition != "disabled":
        prompt_parts.append(composition)
        if "close-up" in composition:
            prompt_parts.append("selfie angle")
    
    # Lighting
    lighting = inputs.get("lighting", "")
    if lighting == "random":
        lighting = random.choice(LIGHTING_TYPES)
    if lighting and lighting != "disabled":
        prompt_parts.append(lighting)
        if "dramatic" in lighting:
            prompt_parts.extend(["sun rays", "surrealism", "(top down:1.3)"])
    
    # Photography style
    photography_style = inputs.get("photography_styles", "")
    if photography_style == "random":
        photography_style = random.choice(PHOTOGRAPHY_STYLES)
    if photography_style and photography_style != "disabled":
        prompt_parts.append(photography_style)
    
    # Device
    device = inputs.get("device", "")
    if device == "random":
        device = random.choice(DEVICES)
    if device and device != "disabled":
        prompt_parts.append(device)
    
    # Additional creative touch
    if "outdoor" in " ".join(prompt_parts):
        prompt_parts.append("on a distant planet's alien landscape")
    
    return ", ".join(prompt_parts)

def parse_comfy_workflow(text_chunks: dict) -> dict:
    result = {}
    try:
        raw = text_chunks.get("workflow")
        if not raw:
            return result

        data = json.loads(raw)
        
        # Collect LoRA information
        lora_models = []

        for node_id, node in data.items():
            inputs = node.get("inputs", {})
            class_type = node.get("class_type", "")

            if class_type == "KSampler":
                result["Steps"] = inputs.get("steps", ["", 0])[0]
                result["Guidance scale"] = inputs.get("cfg", ["", 0])[0]
                result["Sampler"] = inputs.get("sampler_name", "")
                result["Scheduler"] = inputs.get("scheduler", "")
                result["Denoise"] = inputs.get("denoise", "")

            if class_type == "LoraLoader":
                lora_name = inputs.get("lora_name", "")
                if lora_name and lora_name != "\"\"":
                    lora_models.append(lora_name)
                    result["LoRA Model"] = lora_name
                    result["LoRA Strength (model)"] = str(inputs.get("strength_model", ""))
                    result["LoRA Strength (clip)"] = str(inputs.get("strength_clip", ""))

            if class_type == "CheckpointLoaderSimpleExtended":
                result["Model"] = inputs.get("ckpt_name", "")
                result["Model hash"] = inputs.get("ckpt_hash", "")

            if class_type == "PromptGenerator":
                # Use the new function for prompt generation
                prompt = generate_prompt_from_generator(inputs)
                result["Prompt"] = prompt

            if class_type == "Save Image w/Metadata":
                result["Version"] = "ComfyUI"
                # LoRA models from the Save Image node
                if "lora_list" in inputs:
                    lora_models.append(inputs["lora_list"])
        
        # Add LoRA models to the prompt
        if lora_models and "Prompt" in result:
            result["Prompt"] = result["Prompt"] + ", " + ", ".join(set(lora_models))

    except Exception as e:
        print(f"Error parsing workflow: {e}")
    return result

def parse_parameters(text_chunks: dict) -> dict:
    result = {}

    # Ignore the "prompt" field entirely when it contains JSON data
    if "prompt" in text_chunks:
        prompt_text = text_chunks["prompt"].strip()
        # Only use it when it is not JSON
        if not prompt_text.startswith("{"):
            result["Prompt"] = prompt_text

    parameters = text_chunks.get("parameters", "")
    if parameters:
        split = re.split(r"(?i)negative[\s_]?prompt\s*:", parameters, maxsplit=1)
        if len(split) == 2:
            if "Prompt" not in result:
                result["Prompt"] = split[0].strip()
            result["Negative prompt"] = split[1].splitlines()[0].strip()
            rest = "\n".join(split[1].splitlines()[1:])
        else:
            rest = parameters.strip()
        
        lines = [line.strip() for line in rest.split("\n") if line.strip()]
        combined = ", ".join(lines)

        pattern = r"([\w \+\(\)\-\:\/]+?):\s*([^,\n]+)"
        matches = re.findall(pattern, combined)

        for key, value in matches:
            clean_key = key.strip().replace("CFG scale", "Guidance scale")
            result[clean_key] = value.strip()

    return result

# Existing route for local files
@router.post("/extract-metadata/")
async def extract_image_metadata(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".png"):
        raise HTTPException(status_code=400, detail="Nur PNG-Dateien erlaubt.")

    image_bytes = await file.read()
    img = Image.open(BytesIO(image_bytes))

    if not img.text or ("parameters" not in img.text and "prompt" not in img.text and "workflow" not in img.text):
        raise HTTPException(status_code=404, detail="Keine KI-Metadaten im Bild gefunden.")

    # Parse parameters first
    meta = parse_parameters(img.text)
    
    # Then parse the workflow - this overrides the prompt if a PromptGenerator is found
    workflow_meta = parse_comfy_workflow(img.text)
    
    # Workflow data has priority over parameters
    meta.update(workflow_meta)
    
    # Remove the prompt if it still contains JSON
    if "Prompt" in meta and isinstance(meta["Prompt"], str):
        if meta["Prompt"].strip().startswith("{"):
            # If a workflow existed but no PromptGenerator,
            # try to find the prompt from other sources
            if "workflow" in img.text and "PromptGenerator" not in img.text.get("workflow", ""):
                # Delete the JSON prompt
                del meta["Prompt"]
    
    return {"metadata": meta}

# New route for URL-based metadata extraction
@router.post("/extract-metadata-url/")
async def extract_image_metadata_from_url(request: ImageUrlRequest, req: Request):
    try:
        # Read API key from cookie if not provided in the request
        api_key = request.api_key
        if not api_key and "civitai-api-key" in req.cookies:
            api_key = req.cookies["civitai-api-key"]
        
        # Check if it is a Civitai URL
        if "civitai.com" in request.url:
            return await extract_civitai_metadata(request.url, api_key)
        
        # Regular metadata extraction for other URLs
        response = requests.get(request.url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, timeout=30)
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Konnte Bild nicht von URL laden. Status: {response.status_code}")
        
        # Open the image
        image_bytes = BytesIO(response.content)
        try:
            img = Image.open(image_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Ungültiges Bildformat: {str(e)}")
        
        # Check if the image has metadata (PNG-specific)
        if not hasattr(img, 'text') or not img.text:
            raise HTTPException(status_code=404, detail="Keine KI-Metadaten im Bild gefunden. Nur PNG-Bilder mit eingebetteten Metadaten werden unterstützt.")
        
        # Check if relevant metadata is present
        if not any(key in img.text for key in ["parameters", "prompt", "workflow"]):
            raise HTTPException(status_code=404, detail="Keine unterstützten KI-Metadaten gefunden.")
        
        # Use the same metadata extraction as for local files
        meta = parse_parameters(img.text)
        workflow_meta = parse_comfy_workflow(img.text)
        meta.update(workflow_meta)
        
        # JSON cleanup
        if "Prompt" in meta and isinstance(meta["Prompt"], str):
            if meta["Prompt"].strip().startswith("{"):
                if "workflow" in img.text and "PromptGenerator" not in img.text.get("workflow", ""):
                    del meta["Prompt"]
        
        return {"metadata": meta}
        
    except HTTPException:
        raise
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=408, detail="Timeout beim Laden der URL")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Netzwerkfehler: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Verarbeiten: {str(e)}")

# Helper function for Civitai metadata extraction
async def extract_civitai_metadata(url: str, api_key: Optional[str] = None):
    try:
        print(f"[DEBUG] Civitai URL received: {url}")
        
        # Extract the image ID from the URL
        image_id = None
        
        # Pattern for direct image pages (e.g. https://civitai.com/images/123456)
        if "civitai.com/images/" in url and not "image.civitai.com" in url:
            match = re.search(r'/images/(\d+)', url)
            if match:
                image_id = match.group(1)
                print(f"[DEBUG] Extracted image ID from web URL: {image_id}")
                # This is a webpage URL, not a direct image
                # We need to use the API
                result = await get_civitai_metadata_by_id(image_id, api_key)
                if result:
                    return result
                else:
                    # Fallback: try scraping the URL directly
                    return await scrape_civitai_page(url, api_key)
        
        # Pattern for CDN URLs (e.g. https://image.civitai.com/.../00228-2584352429.jpeg)
        elif "image.civitai.com" in url:
            print(f"[DEBUG] Detected CDN URL")
            # The real ID is often the number after the dash
            match = re.search(r'/\d+-(\d+)\.(jpeg|jpg|png)', url)
            if match:
                image_id = match.group(1)
                print(f"[DEBUG] Extracted image ID from CDN URL: {image_id}")
            else:
                # Alternatively try to find the largest number in the URL
                numbers = re.findall(r'\d{6,}', url)  # Zahlen mit mindestens 6 Ziffern
                if numbers:
                    image_id = max(numbers)  # Take the largest number
                    print(f"[DEBUG] Extracted image ID from numbers: {image_id}")
            
            if image_id:
                # Try the API first
                result = await get_civitai_metadata_by_id(image_id, api_key)
                if result:
                    return result
            
            # Fallback: attempt PNG extraction
            return await fallback_to_png_extraction(url)
        
        # No recognized Civitai URL
        raise HTTPException(status_code=400, detail="Keine gültige Civitai-URL erkannt")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Extrahieren der Civitai-Metadaten: {str(e)}")

# New function to scrape the Civitai page
async def scrape_civitai_page(url: str, api_key: Optional[str] = None):
    """Fallback: Versuche die Webseite zu scrapen wenn die API nicht funktioniert"""
    try:
        print(f"[DEBUG] Attempting to scrape Civitai page: {url}")
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Konnte Civitai-Seite nicht laden: Status {response.status_code}"
            )
        
        # Try to find JSON-LD data (often embedded in pages)
        import re
        json_ld_pattern = r'<script type="application/ld\+json">(.*?)</script>'
        matches = re.findall(json_ld_pattern, response.text, re.DOTALL)
        
        if matches:
            for match in matches:
                try:
                    data = json.loads(match)
                    # Extract relevant data from JSON-LD
                    if isinstance(data, dict):
                        meta = {}
                        if "name" in data:
                            meta["Title"] = data["name"]
                        if "description" in data:
                            meta["Description"] = data["description"]
                        return {"metadata": meta}
                except:
                    continue
        
        # Alternative: search for Next.js __NEXT_DATA__
        next_data_pattern = r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>'
        next_matches = re.findall(next_data_pattern, response.text, re.DOTALL)
        
        if next_matches:
            try:
                next_data = json.loads(next_matches[0])
                # Try to extract metadata from Next.js data
                if "props" in next_data and "pageProps" in next_data["props"]:
                    page_props = next_data["props"]["pageProps"]
                    meta = {}
                    
                    # Search through various possible structures
                    if "image" in page_props:
                        image_data = page_props["image"]
                        if "meta" in image_data:
                            if "prompt" in image_data["meta"]:
                                meta["Prompt"] = image_data["meta"]["prompt"]
                            if "negativePrompt" in image_data["meta"]:
                                meta["Negative prompt"] = image_data["meta"]["negativePrompt"]
                    
                    if meta:
                        return {"metadata": meta}
            except:
                pass
        
        raise HTTPException(
            status_code=404,
            detail="Konnte keine Metadaten aus der Civitai-Seite extrahieren. Die Seitenstruktur könnte sich geändert haben."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Scrapen der Civitai-Seite: {str(e)}"
        )


# New function for API fetch
async def get_civitai_metadata_by_id(image_id: str, api_key: Optional[str] = None):
    try:
        headers = {"User-Agent": "Lokarni-Importer/1.0"}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        
        # Try different API endpoints
        endpoints = [
            f"https://civitai.com/api/v1/images/{image_id}",
            f"https://civitai.com/api/v1/posts/{image_id}",  # Alternative
        ]
        
        for api_url in endpoints:
            print(f"[DEBUG] Trying API endpoint: {api_url}")
            response = requests.get(api_url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data:
                    # Success! Process the data
                    return process_civitai_api_response(data)
            elif response.status_code == 401:
                raise HTTPException(
                    status_code=401,
                    detail="Authentifizierung fehlgeschlagen. Bitte überprüfen Sie Ihren Civitai API-Key."
                )
            elif response.status_code == 403:
                raise HTTPException(
                    status_code=403,
                    detail="Zugriff verweigert. Dieses Bild erfordert möglicherweise einen API-Key oder ist privat."
                )
        
        # If no endpoint worked
        print(f"[DEBUG] All API endpoints failed for ID: {image_id}")
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[DEBUG] API error: {str(e)}")
        return None

def process_civitai_api_response(data: dict) -> dict:
    """Verarbeite die API-Antwort und extrahiere Metadaten"""
    meta = {}
    
    # Meta data
    if "meta" in data:
        meta_data = data["meta"]
        if "prompt" in meta_data:
            meta["Prompt"] = meta_data["prompt"]
        if "negativePrompt" in meta_data:
            meta["Negative prompt"] = meta_data["negativePrompt"]
        if "cfgScale" in meta_data:
            meta["Guidance scale"] = str(meta_data["cfgScale"])
        if "steps" in meta_data:
            meta["Steps"] = str(meta_data["steps"])
        if "sampler" in meta_data:
            meta["Sampler"] = meta_data["sampler"]
        if "seed" in meta_data:
            meta["Seed"] = str(meta_data["seed"])
        if "Size" in meta_data:
            meta["Size"] = meta_data["Size"]
        if "Model" in meta_data:
            meta["Model"] = meta_data["Model"]
        if "Model hash" in meta_data:
            meta["Model hash"] = meta_data["Model hash"]
        
        # Include all other meta fields as well
        for key, value in meta_data.items():
            if key not in meta and value is not None:
                meta[key] = str(value)
    
    # Model version info
    if "modelVersion" in data:
        version = data["modelVersion"]
        if "name" in version:
            meta["Model version"] = version["name"]
        if "baseModel" in version:
            meta["Base model"] = version["baseModel"]
    
    # Model info
    if "model" in data:
        model = data["model"]
        if "name" in model:
            meta["Model name"] = model["name"]
        if "type" in model:
            meta["Type"] = model["type"]
    
    # Resources (LoRAs, etc.)
    if "resources" in data:
        resources = []
        for resource in data["resources"]:
            name = resource.get("name", "Unknown")
            type_ = resource.get("type", "")
            weight = resource.get("weight", 1.0)
            resources.append(f"{name} ({type_}: {weight})")
        if resources:
            meta["Used resources"] = ", ".join(resources)
    
    # Tags
    if "tags" in data:
        meta["Tags"] = ", ".join(data["tags"])
    
    # URL to the actual image
    if "url" in data:
        meta["Image URL"] = data["url"]
    
    # Stats
    if "stats" in data:
        stats = data["stats"]
        if "heartCount" in stats:
            meta["Hearts"] = str(stats["heartCount"])
        if "likeCount" in stats:
            meta["Likes"] = str(stats["likeCount"])
    
    if not meta:
        return None
    
    return {"metadata": meta}


# Fallback for PNG extraction
async def fallback_to_png_extraction(url: str):
    try:
        response = requests.get(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, timeout=30)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=400, 
                detail="Civitai API konnte das Bild nicht finden und direkter Download schlug fehl. Möglicherweise ist das Bild privat oder erfordert einen API-Key."
            )
        
        # Check the content type
        content_type = response.headers.get('content-type', '').lower()
        is_jpeg = 'jpeg' in content_type or 'jpg' in content_type or url.lower().endswith(('.jpg', '.jpeg'))
        
        if is_jpeg:
            raise HTTPException(
                status_code=422, 
                detail="JPEG-Bilder enthalten keine eingebetteten PNG-Metadaten. Civitai CDN-Bilder sind meist JPEG ohne Metadaten. Verwenden Sie entweder die Original-Civitai-Seite (z.B. https://civitai.com/images/[ID]) oder laden Sie ein PNG mit eingebetteten Metadaten hoch."
            )
        
        image_bytes = BytesIO(response.content)
        try:
            img = Image.open(image_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Konnte Bild nicht öffnen: {str(e)}")
        
        # Check if it is PNG
        if img.format != 'PNG':
            raise HTTPException(
                status_code=422, 
                detail=f"Das Bild ist im {img.format}-Format. Nur PNG-Bilder können eingebettete Metadaten enthalten."
            )
        
        if not hasattr(img, 'text') or not img.text:
            raise HTTPException(
                status_code=404, 
                detail="Das PNG-Bild enthält keine eingebetteten Metadaten."
            )
        
        # Use normal PNG extraction
        meta = parse_parameters(img.text)
        workflow_meta = parse_comfy_workflow(img.text)
        meta.update(workflow_meta)
        
        if not meta:
            raise HTTPException(
                status_code=404, 
                detail="Keine verwertbaren Metadaten im PNG gefunden."
            )
        
        return {"metadata": meta}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Fehler beim Verarbeiten des Bildes: {str(e)}"
        )
