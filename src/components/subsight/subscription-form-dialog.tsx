"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    Subscription,
    SubscriptionFormData,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertTriangle, CalendarIcon, Loader2, Lock, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";
import { Alert, AlertDescription } from "../ui/alert";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

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
  reminderEnabled: z.boolean().optional(),
  reminderDaysBefore: z
    .coerce
    .number()
    .refine((v) => [1, 3, 7, 14].includes(v), { message: "Invalid reminder timing." })
    .optional(),
});

interface SubscriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription;
}

function SubscriptionForm({
  onDone,
  subscription,
}: {
  onDone: () => void;
  subscription?: Subscription;
}) {
  const { addSubscription, updateSubscription, subscriptions, showUpgradePrompt } = useSubscriptions();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [duplicateWarnings, setDuplicateWarnings] = useState<any[]>([]);
  const isPro = profile?.subscription_tier === "pro";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: subscription
      ? {
          ...subscription,
          startDate: new Date(subscription.startDate),
          amount: subscription.amount,
          reminderEnabled: subscription.reminderEnabled ?? false,
          reminderDaysBefore: subscription.reminderDaysBefore ?? 3,
        }
      : {
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
          reminderEnabled: false,
          reminderDaysBefore: 3,
        },
  });

  const billingCycle = form.watch("billingCycle");
  const reminderEnabled = form.watch("reminderEnabled");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Check for duplicates before adding
    if (!subscription) {
      const formData = {
        ...values,
        icon: values.icon || "default",
        notes: values.notes || "",
        startDate: values.startDate.toISOString(),
        reminderDaysBefore: (values.reminderDaysBefore ?? 3) as 1 | 3 | 7 | 14,
      };
      const duplicates = findDuplicates(formData, subscriptions);
      if (duplicates.length > 0) {
        setDuplicateWarnings(duplicates);
        return;
      }
    }

    const data: SubscriptionFormData = {
      ...values,
      icon: values.icon || "default",
      startDate: values.startDate.toISOString(),
      notes: values.notes || "",
      usageCount: 0,
      reminderEnabled: values.reminderEnabled ?? false,
      reminderDaysBefore: (values.reminderDaysBefore ?? 3) as 1 | 3 | 7 | 14,
    };

    if (subscription) {
      await updateSubscription(subscription.id, data);
      toast({ title: "Success", description: "Subscription updated." });
    } else {
      try {
        await addSubscription(data);
        toast({ title: "Success", description: "Subscription added." });
      } catch (e: any) {
        if (e?.upgrade) return;
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add subscription.",
        });
        return;
      }
    }
    onDone();
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3 sm:space-y-4"
      >
        {/* Duplicate Warning */}
        {duplicateWarnings.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-2">
                <p className="font-medium">Possible duplicates found:</p>
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
                        startDate: form.getValues().startDate.toISOString(),
                        notes: form.getValues().notes || "",
                        usageCount: 0,
                        reminderDaysBefore: (form.getValues().reminderDaysBefore ?? 3) as 1 | 3 | 7 | 14,
                      };
                      (async () => {
                        try {
                          await addSubscription(data);
                          toast({
                            title: "Success",
                            description: "Subscription added anyway.",
                          });
                          onDone();
                        } catch (e: any) {
                          if (e?.upgrade) return;
                          toast({
                            variant: "destructive",
                            title: "Error",
                            description: "Failed to add subscription.",
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
        {/* Subscription Name with AI Fill */}
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
                    className="h-9 sm:h-10 text-sm"
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAiFill}
                  disabled={isAiLoading}
                  className="h-9 sm:h-10 w-9 sm:w-10 p-0"
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          {isAiLoading ? (
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          ) : isPro ? (
                            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
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
                  <span className="sr-only">AI Fill</span>
                </Button>
              </div>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Icon Selection - Compact for mobile */}
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
                  className="w-full"
                >
                  <Accordion type="single" collapsible className="border-none">
                    {Object.entries(ICON_CATEGORIES).map(
                      ([category, icons]) => (
                        <AccordionItem
                          value={category}
                          key={category}
                          className="border border-border rounded-md mb-2 last:mb-0"
                        >
                          <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                            {category}
                          </AccordionTrigger>
                          <AccordionContent className="px-3 pb-3">
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
                              {Object.entries(icons).map(([key, Icon]) => (
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
                                        "p-2 sm:p-3 rounded-md border-2 transition-colors",
                                        field.value === key
                                          ? "border-primary bg-accent"
                                          : "border-transparent hover:bg-muted"
                                      )}
                                    >
                                      <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                                    </div>
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    )}
                  </Accordion>
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Provider and Category */}
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
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
                    className="h-9 sm:h-10 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
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
                    className="h-9 sm:h-10 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Amount, Currency, and Billing Cycle */}
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-2">
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
                    className="h-9 sm:h-10 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
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
                    <SelectTrigger className="h-9 sm:h-10 text-sm">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-sm">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
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
                    <SelectTrigger className="h-9 sm:h-10 text-sm">
                      <SelectValue placeholder="Cycle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BILLING_CYCLES.map((c) => (
                      <SelectItem
                        key={c}
                        value={c}
                        className="capitalize text-sm"
                      >
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Start Date */}
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
                        "w-full justify-start text-left font-normal h-9 sm:h-10 text-sm",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Notes */}
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
                  className="min-h-[60px] sm:min-h-[80px] text-sm resize-none"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Status Switches */}
        <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <FormField
            control={form.control}
            name="activeStatus"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                <FormLabel className="text-sm font-normal">Active</FormLabel>
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
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                <FormLabel className="text-sm font-normal">
                  Auto renews
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

        {/* Pro-only reminders (edit only) */}
        {subscription && isPro && billingCycle !== "one-time" && (
          <div className="space-y-2 rounded-lg border p-3 shadow-sm">
            <FormField
              control={form.control}
              name="reminderEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <FormLabel className="text-sm font-normal">Email reminder</FormLabel>
                  <FormControl>
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {reminderEnabled && (
              <FormField
                control={form.control}
                name="reminderDaysBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Remind me</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={String(field.value ?? 3)}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 3, 7, 14].map((d) => (
                          <SelectItem key={d} value={String(d)} className="text-sm">
                            {d} day{d === 1 ? "" : "s"} before
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full h-10 text-sm font-medium">
          {subscription ? "Save Changes" : "Add Subscription"}
        </Button>
      </form>
    </Form>
  );
}

export function AddSubscriptionDialog({
  isOpen,
  onOpenChange,
}: SubscriptionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[400px] sm:max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <DialogTitle className="text-base sm:text-lg md:text-xl">
            Add Subscription
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Enter the details of your subscription below. Use the magic wand to
            autofill with AI.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 sm:p-6 pt-2">
          <SubscriptionForm onDone={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EditSubscriptionDialog({
  isOpen,
  onOpenChange,
  subscription,
}: Required<SubscriptionDialogProps>) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[400px] sm:max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <DialogTitle className="text-base sm:text-lg md:text-xl">
            Edit Subscription
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Update the details of your subscription.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 sm:p-6 pt-2">
          <SubscriptionForm
            onDone={() => onOpenChange(false)}
            subscription={subscription}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
