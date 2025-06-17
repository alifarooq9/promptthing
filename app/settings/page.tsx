"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManageKeys } from "@/components/settings/manage-keys";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconChevronLeft } from "@tabler/icons-react";

const settingsTabs = [
  {
    value: "keys",
    label: "Keys",
    Component: <ManageKeys />,
  },
] as const;

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-3xl ">
      <header className="h-12 flex items-center justify-between mt-10">
        <Button
          size="sm"
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          <IconChevronLeft /> Back
        </Button>
      </header>
      <main className="container mx-auto max-w-3xl ">
        <Tabs defaultValue={settingsTabs[0].value} className="mt-8">
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
      </main>
    </div>
  );
}
