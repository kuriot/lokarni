import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Github,
  Coffee,
  Heart,
  ExternalLink,
  Cpu,
  BookOpen,
  Info,
  Calendar,
} from "lucide-react";

export default function SettingsContent() {
  const [showChangelog, setShowChangelog] = useState(false);

  const versions = [
    {
      version: "2.5.0",
      date: "2025-05-17",
      notes: "Improved UI, UX, usability and performance",
    },
    {
      version: "2.0.0",
      date: "2025-04-12",
      notes: "Complete rewrite with improved UI and performance",
    },
    {
      version: "1.2.5",
      date: "2024-11-20",
      notes: "Added support for batch operations",
    },
    {
      version: "1.1.0",
      date: "2024-08-15",
      notes: "New importing features from CivitAI",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Program Info Section */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-zinc-900 to-zinc-800 pb-4 border-b border-zinc-700">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Info className="w-5 h-5" />
            About Lokarni
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="text-primary gap-1">
              <Cpu className="w-3 h-3" />
              Version 2.5.0
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Calendar className="w-3 h-3" />
              Released May 2025
            </Badge>
          </div>

          <p className="text-zinc-300">
LokArni is a locally hosted fullstack web application for organizing, visualizing, and reusing AI-related content.
You can centrally store, search, categorize, and soon directly edit models (e.g., LORAs, Checkpoints), images, videos, and associated metadata.
          </p>


          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChangelog(!showChangelog)}
              className="text-primary border-primary/30 hover:bg-primary/20"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {showChangelog ? "Hide Changelog" : "View Changelog"}
            </Button>
          </div>

          {showChangelog && (
            <div className="mt-4 space-y-4 animate-in fade-in-50 slide-in-from-top-5 duration-300">
              <h3 className="font-medium text-zinc-200">Changelog</h3>
              <div className="space-y-3">
                {versions.map((item, i) => (
                  <div
                    key={i}
                    className="bg-zinc-800/50 rounded-md p-3 border border-zinc-700/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="text-primary">
                        v{item.version}
                      </Badge>
                      <span className="text-xs text-zinc-400">{item.date}</span>
                    </div>
                    <p className="text-sm text-zinc-300">{item.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Developer Section */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-zinc-900 to-zinc-800 pb-4 border-b border-zinc-700">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Heart className="w-5 h-5" />
            Developer & Creator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-2 border-primary/30">
              <AvatarImage src="/src/assets/Arni.png" alt="Developer" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>

            <div className="space-y-4 text-center sm:text-left">
              <div>
                <h3 className="text-xl font-bold text-white">Arni</h3>
                <p className="text-zinc-400">Creator of Chaos</p>
              </div>

              <p className="text-zinc-300 max-w-md">
                I'm not a company – just a guy with an idea. Lokarni is my
                passion project to make life easier for AI enthusiasts. Models,
                images, resources? All in one place, neatly organized.
                <br />
                <br />
                If you’re using Lokarni or simply love the idea, support on
                Patreon or Ko-fi would mean the world. Every bit helps push the
                project forward 💪
              </p>

<div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
  <Button variant="ghost" size="sm" asChild className="bg-zinc-800 hover:bg-zinc-700 gap-2 px-3">
    <a href="https://github.com/Pixel-Arni" target="_blank" rel="noopener noreferrer">
      <Github className="w-4 h-4" />
      <span className="text-sm text-white">GitHub</span>
    </a>
  </Button>

  <Button variant="ghost" size="sm" asChild className="bg-zinc-800 hover:bg-zinc-700 gap-2 px-3">
    <a href="https://ko-fi.com/cranic" target="_blank" rel="noopener noreferrer">
      <Coffee className="w-4 h-4 text-pink-500" />
      <span className="text-sm text-white">Ko-fi</span>
    </a>
  </Button>

  <Button variant="ghost" size="sm" asChild className="bg-zinc-800 hover:bg-zinc-700 gap-2 px-3">
    <a href="https://www.twitch.tv/cranic" target="_blank" rel="noopener noreferrer">
      <ExternalLink className="w-4 h-4 text-purple-500" />
      <span className="text-sm text-white">Twitch</span>
    </a>
  </Button>

  <Button variant="ghost" size="sm" asChild className="bg-zinc-800 hover:bg-zinc-700 gap-2 px-3">
    <a href="https://www.instagram.com/arni_cranic/" target="_blank" rel="noopener noreferrer">
      <ExternalLink className="w-4 h-4 text-pink-400" />
      <span className="text-sm text-white">Instagram</span>
    </a>
  </Button>

  <Button variant="ghost" size="sm" asChild className="bg-zinc-800 hover:bg-zinc-700 gap-2 px-3">
    <a href="https://www.tiktok.com/@cranic92" target="_blank" rel="noopener noreferrer">
      <ExternalLink className="w-4 h-4 text-white" />
      <span className="text-sm text-white">TikTok</span>
    </a>
  </Button>

  <Button variant="ghost" size="sm" asChild className="bg-zinc-800 hover:bg-zinc-700 gap-2 px-3">
    <a href="https://www.patreon.com/c/Arni_Cranic" target="_blank" rel="noopener noreferrer">
      <Heart className="w-4 h-4 text-red-500" />
      <span className="text-sm text-white">Support me</span>
    </a>
  </Button>
</div>

            </div>
          </div>

          <Separator className="my-6 bg-zinc-800" />

          <div className="text-center">
            <p className="text-zinc-400 text-sm">
              Special thanks to all contributors and supporters that make this
              project possible.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Information Specialist Developer Section */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-zinc-900 to-zinc-800 pb-4 border-b border-zinc-700">
          <CardTitle className="flex items-center gap-2 text-primary">
            <BookOpen className="w-5 h-5" />
            Development Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-2 border-primary/30">
              <AvatarImage src="/src/assets/Astroburner.png" alt="Information Specialist" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>

            <div className="space-y-4 text-center sm:text-left">
              <div>
                <h3 className="text-xl font-bold text-white">Astroburner</h3>
                <p className="text-zinc-400">Information Specialist</p>
              </div>

              <p className="text-zinc-300 max-w-md">
                I'm a digital artist and AI creative with a passion for blending technology and visual storytelling. My focus lies in character design, LoRA training, and cinematic AI imagery – especially in the fields of emotion-driven art, futuristic aesthetics, and human expression. I love experimenting with tools like ComfyUI, Invoke, Kita, Stable Diffusion, and prompt engineering to push the boundaries of visual narrative and identity. Always open to creative collaboration.
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                <Button variant="ghost" size="icon" asChild className="bg-zinc-800 hover:bg-zinc-700">
                  <a href="https://github.com/Astroburner" target="_blank" rel="noopener noreferrer">
                    <Github className="w-5 h-5" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild className="bg-zinc-800 hover:bg-zinc-700">
                  <a href="https://civitai.com/user/Astroburner" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-5 h-5 text-blue-400" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}