import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAvailableProviders, getModelsByProvider } from "@/lib/models";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConfigStore } from "@/store/use-config";
import { ModelConfig, Provider } from "@/config/models";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ManageKeys() {
  const { appendKey, keys: storedKeys } = useConfigStore();

  const [keys, setKeys] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    setKeys(storedKeys as Record<string, string>);
  }, [storedKeys]);

  const [handleSaveChangesState, setHandleSaveChangesState] = React.useState<{
    loading: boolean;
    error?: string;
  }>({
    loading: false,
    error: undefined,
  });

  const availableProvidersForKeys = getAvailableProviders();
  const availableModelsAccordingToKeys = availableProvidersForKeys.map(
    (provider) => ({
      provider,
      models: getModelsByProvider(provider),
    })
  );

  const handleSaveChanges = () => {
    try {
      setHandleSaveChangesState({ loading: true, error: undefined });
      Object.entries(keys).forEach(([provider, key]) => {
        appendKey(provider as Provider, key);
      });
    } catch (error) {
      setHandleSaveChangesState({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while saving keys.",
      });
    } finally {
      setHandleSaveChangesState({ loading: false, error: undefined });
      toast.success("Keys saved successfully!");
    }
    setKeys(storedKeys as Record<string, string>);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage API Keys</CardTitle>
        <CardDescription>
          Don&apos;t worry everything lives in your browser. We will not steal
          it!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {availableModelsAccordingToKeys.map((item) => (
            <KeyInput
              key={item.provider}
              item={item}
              keys={keys}
              setKeys={setKeys}
            />
          ))}

          <KeyInput
            keys={keys}
            setKeys={setKeys}
            item={{
              provider: "runware",
              models: [
                {
                  availableWhen: "byok",
                  canReason: false,
                  icon: "runware" as "google",
                  model: "runware:100@1",
                  modelName: "Runware:100@1",
                  provider: "runware",
                  supportsWebSearch: false,
                },
              ],
            }}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full cursor-pointer"
          onClick={handleSaveChanges}
          disabled={handleSaveChangesState.loading}
        >
          {handleSaveChangesState.loading ? "Saving..." : "Save Changes"}
        </Button>
        {handleSaveChangesState.error && (
          <span className="text-red-500 ml-2 text-sm">
            {handleSaveChangesState.error ??
              "An error occurred while saving keys."}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}

function KeyInput({
  item,
  keys,
  setKeys,
}: {
  item: {
    provider: Provider;
    models: ModelConfig[];
  };
  keys: Record<string, string>;
  setKeys: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const [show, setShow] = React.useState(false);

  return (
    <div key={item.provider} className="space-y-2">
      <div className="flex flex-wrap gap-1">
        <Label className="capitalize">{item.provider}</Label>

        {item.models.length > 0 ? (
          <div>
            <Badge className="capitalize">{item.models[0].modelName}</Badge>
            {item.models.length > 1 && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="ml-1">
                    {item.models.length > 1 && `+${item.models.length - 1}`}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    {item.models.slice(1).map((model) => (
                      <p key={model.modelName} className="text-xs capitalize">
                        {model.modelName}
                      </p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            No models available for {item.provider}
          </span>
        )}
      </div>

      <div className="relative w-full">
        <Input
          key={item.provider}
          placeholder={`Enter ${item.provider} API Key`}
          value={keys[item.provider] || ""}
          onChange={(e) =>
            setKeys((prev) => ({
              ...prev,
              [item.provider]: e.target.value,
            }))
          }
          type={show ? "text" : "password"}
          className="pe-9"
        />

        <Button
          size="icon"
          variant="ghost"
          className="absolute top-1/2 right-0.5 h-8 w-8 -translate-y-1/2 cursor-pointer"
          onClick={() => setShow(!show)}
        >
          {show ? <IconEyeOff /> : <IconEye />}
        </Button>
      </div>
    </div>
  );
}
