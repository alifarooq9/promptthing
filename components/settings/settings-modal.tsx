"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsModalStore } from "@/store/use-settings-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManageKeys } from "@/components/settings/manage-keys";

const settingsTabs = [
  {
    value: "keys",
    label: "Keys",
    Component: <ManageKeys />,
  },
  {
    value: "models",
    label: "Models",
    Component: <Placeholder />,
  },
] as const;

export function SettingsModal() {
  const { isOpen, close, open } = useSettingsModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={(o) => (o ? open() : close())}>
      <DialogContent className="max-h-[calc(100svh-3rem)]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <div className="mt-4">
            <Tabs defaultValue={settingsTabs[0].value}>
              <TabsList>
                {settingsTabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {settingsTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {tab.Component}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function Placeholder() {
  return <div>Placeholder content</div>;
}
