"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import { useSubscriptions } from "@/contexts/subscription-context";
import { useToast } from "@/hooks/use-toast";
import { findDuplicates } from "@/lib/duplicates";
import {
    BILLING_CYCLES,
    CATEGORY_ICONS,
    CURRENCIES,
    ICON_CATEGORIES,
    SubscriptionFormData,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertTriangle, ArrowLeft, CalendarIcon, Loader2, Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  provider: z.string().min(2, "Provider must be at least 2 characters."),
  category: z.string().min(2, "Category must be at least 2 characters."),
  icon: z.string().optional(),
  startDate: z.date({ required_error: "A start date is required." }),
  billingCycle: z.enum(BILLING_CYCLES),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  currency: z.enum(CURRENCIES),
  notes: z.string().optional(),
  activeStatus: z.boolean(),
  autoRenew: z.boolean(),
});

export default function AddSubscriptionPage() {
  const router = useRouter();
  const { addSubscription, subscriptions, showUpgradePrompt } = useSubscriptions();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [duplicateWarnings, setDuplicateWarnings] = useState<any[]>([]);
  const isPro = profile?.subscription_tier === "pro";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      provider: "",
      category: "",
      icon: "default",
      startDate: new Date(),
      billingCycle: "monthly",
      amount: 0,
      currency: "USD",
      notes: "",
      activeStatus: true,
      autoRenew: true,
    },
  });

  const watchedValues = form.watch();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = {
      ...values,
      icon: values.icon || "default",
      notes: values.notes || "",
      startDate: values.startDate.toISOString(),
    };
    const duplicates = findDuplicates(formData, subscriptions);
    if (duplicates.length > 0) {
      setDuplicateWarnings(duplicates);
      return;
    }

    const data: SubscriptionFormData = {
      ...formData,
      usageCount: 0,
    };

    try {
      await addSubscription(data);
      toast({ title: "Success", description: "Subscription added." });
      router.push("/dashboard");
    } catch (e: any) {
      if (e?.upgrade) return;
      const errorMessage = e?.message || "Failed to add subscription";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  }

  const handleAiFill = async () => {
    if (!isPro) {
      showUpgradePrompt("AI auto fill is available on the Pro plan.");
      return;
    }

    const name = form.getValues("name");
    if (!name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a subscription name first.",
      });
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const details = await res.json();

      form.setValue("provider", details.provider || "", { shouldValidate: true });
      form.setValue("category", details.category || "", { shouldValidate: true });
      form.setValue("amount", Number(details.amount) || 0, { shouldValidate: true });
      form.setValue("currency", (details.currency || "USD") as any, {
        shouldValidate: true,
      });
      form.setValue("billingCycle", (details.billingCycle || "monthly") as any, {
        shouldValidate: true,
      });
      form.setValue("autoRenew", Boolean(details.autoRenew), { shouldValidate: true });

      const categoryLower = String(details.category || "").toLowerCase();
      const matchedIcon = Object.keys(CATEGORY_ICONS).find((key) =>
        categoryLower.includes(key)
      );
      form.setValue("icon", matchedIcon || "default", { shouldValidate: true });

      toast({
        title: "AI Assistant",
        description: "Fields have been pre-filled.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not fetch subscription details.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const Icon =
    CATEGORY_ICONS[watchedValues.icon as keyof typeof CATEGORY_ICONS] ||
    CATEGORY_ICONS.default;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Form Section */}
        <div className="flex-1 lg:w-2/3 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 h-screen lg:h-auto">
          <div className="max-w-3xl mx-auto p-3 sm:p-4 md:p-6 lg:p-12 pb-20 sm:pb-24">
            <div className="mb-6 sm:mb-8">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="mb-4 sm:mb-6 text-gray-400 hover:text-white text-sm"
              >
                <ArrowLeft className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                Add Subscription
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-400">
                Track your recurring payments with AI powered insights
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 sm:space-y-4 md:space-y-6"
              >
                {duplicateWarnings.length > 0 && (
                  <Alert className="border-orange-500 bg-orange-950/50">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <AlertDescription className="text-orange-200">
                      <div className="space-y-2">
                        <p className="font-medium">
                          Possible duplicates found:
                        </p>
                        {duplicateWarnings.map((dup, i) => (
                          <p key={i} className="text-sm">
                            • {dup.subscription.name} ({dup.reason})
                          </p>
                        ))}
                        <div className="flex gap-2 mt-3">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              setDuplicateWarnings([]);
                              const data: SubscriptionFormData = {
                                ...form.getValues(),
                                icon: form.getValues().icon || "default",
                                startDate: form
                                  .getValues()
                                  .startDate.toISOString(),
                                notes: form.getValues().notes || "",
                                usageCount: 0,
                              };
                              (async () => {
                                try {
                                  await addSubscription(data);
                                  toast({
                                    title: "Success",
                                    description: "Subscription added.",
                                  });
                                  router.push("/dashboard");
                                } catch (e: any) {
                                  if (e?.upgrade) return;
                                  const errorMessage = e?.message || "Failed to add subscription";
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: errorMessage,
                                  });
                                }
                              })();
                            }}
                          >
                            Add Anyway
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDuplicateWarnings([])}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Subscription Name</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="e.g. Netflix"
                            {...field}
                            className="bg-zinc-900 border-zinc-800 h-9 sm:h-10 md:h-12 text-sm"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAiFill}
                          disabled={isAiLoading}
                          className="h-9 sm:h-10 md:h-12 px-2.5 sm:px-3 md:px-4 bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  {isAiLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : isPro ? (
                                    <Sparkles className="h-4 w-4" />
                                  ) : (
                                    <Lock className="h-4 w-4" />
                                  )}
                                </span>
                              </TooltipTrigger>
                              {!isPro && (
                                <TooltipContent>
                                  <p>Pro feature</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Icon</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <Accordion type="single" collapsible>
                            {Object.entries(ICON_CATEGORIES).map(
                              ([category, icons]) => (
                                <AccordionItem
                                  value={category}
                                  key={category}
                                  className="border-zinc-800"
                                >
                                  <AccordionTrigger className="hover:no-underline text-gray-300 text-sm py-3">
                                    {category}
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5 sm:gap-2">
                                      {Object.entries(icons).map(
                                        ([key, IconComp]) => (
                                          <FormItem
                                            key={key}
                                            className="flex items-center justify-center"
                                          >
                                            <FormControl>
                                              <RadioGroupItem
                                                value={key}
                                                id={`icon-${key}`}
                                                className="sr-only"
                                              />
                                            </FormControl>
                                            <FormLabel
                                              htmlFor={`icon-${key}`}
                                              className="cursor-pointer"
                                            >
                                              <div
                                                className={cn(
                                                  "p-2 sm:p-3 rounded-lg border-2 transition-all",
                                                  field.value === key
                                                    ? "border-primary bg-primary/20"
                                                    : "border-zinc-800 hover:bg-zinc-900"
                                                )}
                                              >
                                                <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                                              </div>
                                            </FormLabel>
                                          </FormItem>
                                        )
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              )
                            )}
                          </Accordion>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Provider</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Netflix, Inc."
                            {...field}
                            className="bg-zinc-900 border-zinc-800 h-9 sm:h-10 md:h-12 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Category</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Entertainment"
                            {...field}
                            className="bg-zinc-900 border-zinc-800 h-9 sm:h-10 md:h-12 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            className="bg-zinc-900 border-zinc-800 h-9 sm:h-10 md:h-12 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800 h-9 sm:h-10 md:h-12 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            {CURRENCIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billingCycle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Cycle</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800 h-9 sm:h-10 md:h-12 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            {BILLING_CYCLES.map((c) => (
                              <SelectItem
                                key={c}
                                value={c}
                                className="capitalize"
                              >
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-9 sm:h-10 md:h-12 bg-zinc-900 border-zinc-800 text-sm",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-zinc-900 border-zinc-800"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any notes about this subscription..."
                          {...field}
                          className="min-h-[70px] sm:min-h-[80px] md:min-h-[100px] bg-zinc-900 border-zinc-800 resize-none text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="activeStatus"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-800 p-3 sm:p-4 flex-1 bg-zinc-900">
                        <FormLabel className="font-normal text-sm">Active</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="autoRenew"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-800 p-3 sm:p-4 flex-1 bg-zinc-900">
                        <FormLabel className="font-normal text-sm">
                          Auto Renew
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="sticky bottom-0 bg-black pt-4 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-12 px-3 sm:px-4 md:px-6 lg:px-12 pb-3 sm:pb-4 md:pb-6 lg:pb-12">
                  <Button type="submit" className="w-full h-10 sm:h-11 md:h-12 text-sm sm:text-base">
                    Add Subscription
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="hidden lg:block w-1/3 border-l border-zinc-800 bg-zinc-950 p-8 overflow-y-auto h-screen">
          <div className="sticky top-0 pt-8">
            <h2 className="text-2xl font-bold mb-6">Preview</h2>
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 rounded-xl bg-primary/20 border border-primary/30">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">
                    {watchedValues.name || "Subscription Name"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {watchedValues.provider || "Provider"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-lg font-semibold">
                    {watchedValues.currency} {watchedValues.amount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-gray-400">Billing Cycle</span>
                  <span className="capitalize">
                    {watchedValues.billingCycle}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-gray-400">Category</span>
                  <span>{watchedValues.category || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-gray-400">Start Date</span>
                  <span>
                    {watchedValues.startDate
                      ? format(watchedValues.startDate, "MMM dd, yyyy")
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-gray-400">Status</span>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      watchedValues.activeStatus
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-400"
                    )}
                  >
                    {watchedValues.activeStatus ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">Auto Renew</span>
                  <span>{watchedValues.autoRenew ? "Yes" : "No"}</span>
                </div>
              </div>

              {watchedValues.notes && (
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <p className="text-sm text-gray-400 mb-2">Notes</p>
                  <p className="text-sm">{watchedValues.notes}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
