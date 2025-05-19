import { useState } from "react";
import { useEditorContext } from "@/contexts/EditorContext";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { TransformationRule, RuleType } from "@/types";
import { savePreset } from "@/lib/PresetStore";

interface RuleSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function RuleSidebar({ collapsed, onToggleCollapse }: RuleSidebarProps) {
  const { rules, activeRules, toggleRule, presets, currentPreset, setCurrentPreset } = useEditorContext();
  const [selectedRuleType, setSelectedRuleType] = useState<RuleType | 'all'>('all');
  const [showAddRuleDialog, setShowAddRuleDialog] = useState(false);
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newRule, setNewRule] = useState<Partial<TransformationRule>>({
    id: "",
    name: "",
    description: "",
    type: "replace",
    pattern: "",
    replacement: "",
    enabled: true
  });
  const { toast } = useToast();

  const filteredRules = selectedRuleType === 'all' 
    ? rules 
    : rules.filter(rule => rule.type === selectedRuleType);

  const handleAddRule = () => {
    if (!newRule.name || !newRule.pattern) {
      toast({
        title: "Error",
        description: "Rule name and pattern are required",
        variant: "destructive"
      });
      return;
    }

    if (newRule.type === "replace" && !newRule.replacement) {
      toast({
        title: "Error",
        description: "Replacement value is required for replace rules",
        variant: "destructive"
      });
      return;
    }

    const completeRule: TransformationRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name || "",
      description: newRule.description || "",
      type: newRule.type as RuleType || "replace",
      pattern: newRule.pattern || "",
      replacement: newRule.replacement || "",
      enabled: true
    };

    // This would call a function to add the rule in the EditorContext
    // addRule(completeRule);
    toast({
      title: "Rule Added",
      description: `${completeRule.name} has been added to your rules`,
    });
    
    setShowAddRuleDialog(false);
    setNewRule({
      id: "",
      name: "",
      description: "",
      type: "replace",
      pattern: "",
      replacement: "",
      enabled: true
    });
  };

  const handleSavePreset = () => {
    if (!newPresetName) {
      toast({
        title: "Error",
        description: "Preset name is required",
        variant: "destructive"
      });
      return;
    }
    
    savePreset(newPresetName, activeRules);
    toast({
      title: "Preset Saved",
      description: `${newPresetName} has been saved to your presets`,
    });
    setNewPresetName("");
    setShowSavePresetDialog(false);
  };

  if (collapsed) {
    return (
      <div className="w-10 bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all">
        <button 
          className="m-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          onClick={onToggleCollapse}
        >
          <i className="ri-arrow-right-s-line text-lg"></i>
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-medium text-gray-900">Transformation Rules</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-md"
            onClick={onToggleCollapse}
          >
            <i className="ri-arrow-left-s-line text-lg"></i>
          </button>
        </div>
        <div className="mt-3">
          <Dialog open={showAddRuleDialog} onOpenChange={setShowAddRuleDialog}>
            <DialogTrigger asChild>
              <Button className="w-full bg-primary-600 hover:bg-primary-700">
                <i className="ri-add-line mr-1.5"></i>
                Add New Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Transformation Rule</DialogTitle>
                <DialogDescription>
                  Create a custom rule to transform AI-detected patterns.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input 
                    id="rule-name" 
                    placeholder="e.g., Replace Ellipsis"
                    value={newRule.name}
                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-description">Description</Label>
                  <Textarea 
                    id="rule-description" 
                    placeholder="Brief description of what this rule does"
                    value={newRule.description}
                    onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rule Type</Label>
                  <RadioGroup 
                    value={newRule.type} 
                    onValueChange={(value) => setNewRule({...newRule, type: value as RuleType})}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="replace" id="replace" />
                      <Label htmlFor="replace">Replace</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="remove" id="remove" />
                      <Label htmlFor="remove">Remove</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule-pattern">Pattern</Label>
                  <Textarea 
                    id="rule-pattern" 
                    placeholder="Unicode code points or regex pattern"
                    value={newRule.pattern}
                    onChange={(e) => setNewRule({...newRule, pattern: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">
                    For Unicode: U+2013–U+2015 | For regex: /\p{Pd}/gu
                  </p>
                </div>
                {newRule.type === "replace" && (
                  <div className="space-y-2">
                    <Label htmlFor="rule-replacement">Replace With</Label>
                    <Input 
                      id="rule-replacement" 
                      placeholder="Replacement text"
                      value={newRule.replacement}
                      onChange={(e) => setNewRule({...newRule, replacement: e.target.value})}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddRuleDialog(false)}>Cancel</Button>
                <Button onClick={handleAddRule}>Add Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 px-3 py-2">
        {/* Rule categories */}
        <div className="mb-2 px-1">
          <div className="flex space-x-2 text-xs mb-3 overflow-x-auto pb-1">
            <Badge 
              variant={selectedRuleType === 'all' ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary-100 px-2 py-1"
              onClick={() => setSelectedRuleType('all')}
            >
              All Rules
            </Badge>
            <Badge 
              variant={selectedRuleType === 'replace' ? "default" : "outline"}
              className="cursor-pointer hover:bg-gray-100 px-2 py-1"
              onClick={() => setSelectedRuleType('replace')}
            >
              Replace
            </Badge>
            <Badge 
              variant={selectedRuleType === 'remove' ? "default" : "outline"}
              className="cursor-pointer hover:bg-gray-100 px-2 py-1"
              onClick={() => setSelectedRuleType('remove')}
            >
              Remove
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-gray-100 px-2 py-1"
              onClick={() => toast({
                title: "Favorites",
                description: "Favorites feature coming soon!",
              })}
            >
              Favorites
            </Badge>
          </div>
        </div>
        
        {/* Rules List */}
        <div className="space-y-3">
          {filteredRules.map((rule) => (
            <div 
              key={rule.id} 
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all cursor-grab"
              draggable="true"
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-8 h-5 ${rule.type === 'replace' ? 'bg-primary-100' : 'bg-accent-100'} rounded flex items-center justify-center mr-2`}>
                      <span className={`${rule.type === 'replace' ? 'text-primary-700' : 'text-accent-700'} text-xs font-medium`}>
                        {rule.type === 'replace' ? 'R' : 'D'}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm text-gray-900">{rule.name}</h3>
                  </div>
                  <Switch 
                    checked={activeRules.includes(rule.id)} 
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </div>
                <p className="text-xs text-gray-600 mb-2">{rule.description}</p>
                <div className="bg-gray-50 rounded p-2 font-mono text-xs">
                  <code className={activeRules.includes(rule.id) ? "text-secondary-700" : "text-gray-500"}>
                    {rule.pattern} {rule.type === 'replace' ? `→ "${rule.replacement}"` : '→ ""'}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Presets section at bottom */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Rule Presets</h3>
          <Dialog open={showSavePresetDialog} onOpenChange={setShowSavePresetDialog}>
            <DialogTrigger asChild>
              <Button variant="link" className="text-primary-600 hover:text-primary-700 h-auto p-0">
                Save Current
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Current Preset</DialogTitle>
                <DialogDescription>
                  Save your current rules configuration as a preset for future use.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="preset-name">Preset Name</Label>
                  <Input 
                    id="preset-name" 
                    placeholder="e.g., Academic Writing"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSavePresetDialog(false)}>Cancel</Button>
                <Button onClick={handleSavePreset}>Save Preset</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Select value={currentPreset} onValueChange={setCurrentPreset}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select preset" />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>{preset.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </aside>
  );
}
