import { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { Github, Coffee, MessageCircle, Plus, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import axios from "axios";
import Logo from "../assets/logo.svg";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ onSelectCategory }) {
  const [active, setActive] = useState("All Assets");
  const [groups, setGroups] = useState([]);
  const [openGroups, setOpenGroups] = useState({});

  const specialViews = {
    Add: { icon: Plus, label: "Add", color: "text-emerald-500", bgColor: "hover:bg-emerald-500/10" },
    Manage: { icon: LucideIcons.FolderCog, label: "Manage", color: "text-amber-500", bgColor: "hover:bg-amber-500/10" },
    Settings: { icon: LucideIcons.Settings, label: "Settings", color: "text-blue-500", bgColor: "hover:bg-blue-500/10" },
    Search: { icon: LucideIcons.Search, label: "Search", color: "text-violet-500", bgColor: "hover:bg-violet-500/10" },
  };

  const loadCategories = () => {
    axios.get("/api/categories").then((res) => {
      const fetched = res.data.map((cat) => ({
        title: cat.title,
        items: cat.subcategories.map((s) => ({
          name: s.name,
          icon: s.icon,
        })),
      }));

      const staticGroup = {
        title: "General",
        items: [
          { name: "All Assets", icon: "Grid" },
          { name: "Favorites", icon: "Star" },
        ],
      };

      const filtered = fetched.filter((g) => g.title !== "General");
      setGroups([staticGroup, ...filtered]);

      // Auto-open the active group
      const initialOpen = {};
      [staticGroup, ...filtered].forEach((group) => {
        if (group.items.some(item => item.name === active)) {
          initialOpen[group.title] = true;
        }
      });
      setOpenGroups(initialOpen);
    });
  };

  useEffect(() => {
    loadCategories();
    const handleUpdate = () => loadCategories();
    window.addEventListener("categories-updated", handleUpdate);
    return () => {
      window.removeEventListener("categories-updated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (["Manage", "Settings"].includes(active)) loadCategories();
  }, [active]);

  const handleCategorySelect = (categoryName) => {
    setActive(categoryName);
    onSelectCategory(categoryName);
  };

  const toggleGroup = (groupTitle) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  return (
    <TooltipProvider>
      <aside className="w-72 bg-gradient-to-b from-background to-background/95 backdrop-blur-xl border-r border-border/50 flex flex-col h-full">
        {/* Fixed Header */}
        <div className="p-6 space-y-4 bg-background border-b border-border/50">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <Avatar className="w-14 h-14">
              <AvatarImage src={Logo} alt="Lokarni Logo" />
              <AvatarFallback>LK</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Lokarni
              </h2>
              <Badge variant="secondary" className="mt-1">
                <Sparkles className="w-3 h-3 mr-1" />
                v2.5
              </Badge>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(specialViews).map(([key, { icon: Icon, label, color, bgColor }]) => (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant={active === key ? "default" : "ghost"}
                          size="icon"
                          onClick={() => handleCategorySelect(key)}
                          className={cn(
                            "relative transition-all duration-200",
                            active === key
                              ? "bg-primary text-primary-foreground shadow-lg"
                              : cn(bgColor, color)
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          {active === key && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute inset-0 bg-primary rounded-md -z-10"
                              initial={false}
                              transition={{ type: "spring", stiffness: 600 }}
                            />
                          )}
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="font-medium">
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scrollable Categories */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-3">
            {groups.map((group, index) => {
              const isOpen = openGroups[group.title] ?? false;
              
              return (
                <Collapsible
                  key={`group-${index}-${group.title}`}
                  open={isOpen}
                  onOpenChange={() => toggleGroup(group.title)}
                >
                  <Card className="border-border/50 bg-card/30 backdrop-blur overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 hover:bg-accent/50"
                      >
                        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          {group.title}
                        </span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-4 pb-4 space-y-1"
                          >
                            {group.items.map((item, i) => {
                              const Icon = LucideIcons[item.icon] || LucideIcons.Circle;
                              const isActive = active === item.name;
                              
                              return (
                                <motion.button
                                  key={`${group.title}-${i}-${item.name}`}
                                  whileHover={{ x: 4 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleCategorySelect(item.name)}
                                  className={cn(
                                    "flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200",
                                    isActive
                                      ? "bg-primary text-primary-foreground shadow-md"
                                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  <Icon className="w-4 h-4" />
                                  <span className="text-sm font-medium">{item.name}</span>
                                  {isActive && (
                                    <motion.div
                                      layoutId="categoryActive"
                                      className="ml-auto w-1.5 h-4 bg-primary-foreground rounded-full"
                                      initial={false}
                                      transition={{ type: "spring", stiffness: 400 }}
                                    />
                                  )}
                                </motion.button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <div className="p-4 border-t border-border/50 backdrop-blur bg-background">
          <Card className="border-primary/20 bg-card/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-around">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="hover:text-primary transition-colors"
                    >
                      <a href="https://github.com/Pixel-Arni" target="_blank" rel="noopener noreferrer">
                        <Github className="w-5 h-5" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>GitHub</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="hover:text-primary transition-colors"
                      >
                        <a href="https://ko-fi.com/cranic" target="_blank" rel="noopener noreferrer">
                          <Coffee className="w-5 h-5 text-pink-500" />
                        </a>
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Support</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="hover:text-primary transition-colors"
                    >
                      <a href="https://discord.gg/Y42PRC3ffp" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Discord</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <Separator className="opacity-50" />
              
              <p className="text-xs text-center text-muted-foreground">
                Special thanks to{" "}
                <a
                  href="https://civitai.com/user/Astroburner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline transition-colors"
                >
                  Astroburner
                </a>
              </p>
              
              <p className="text-[10px] text-center text-muted-foreground/60">
                Built with 💜 by Arni aka. Cranic
              </p>
            </CardContent>
          </Card>
        </div>
      </aside>
    </TooltipProvider>
  );
}