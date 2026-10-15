"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FileText, Save, Send, AlertCircle, Calculator } from "lucide-react";
import { toast } from "sonner";

// Validation schema for RFQ bid submission
const RFQBidSchema = z.object({
  items: z.array(
    z.object({
      solicitation_item_id: z.string(),
      unit_price: z.string().min(1, "Unit price is required").refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        "Unit price must be greater than 0"
      ),
      total_price: z.string().optional(),
      quantity: z.number(),
      item_name: z.string().optional(),
      description: z.string().optional(),
    })
  ).min(1, "At least one item is required"),
  delivery_time: z.string().min(1, "Delivery time is required"),
  payment_terms: z.string().min(1, "Payment terms are required"),
  validity_period: z.string().min(1, "Validity period is required"),
  currency: z.string().default("NGN"),
  warranty: z.string().optional(),
});

type RFQBidFormData = z.infer<typeof RFQBidSchema>;

interface SolicitationItem {
  id: string;
  item?: {
    name: string;
  };
  description?: string;
  specification?: string;
  quantity: number;
  lot?: {
    name: string;
  };
}

interface RFQBidFormProps {
  rfqId: string;
  items: SolicitationItem[];
  lotId?: string;
  onSubmit: (data: RFQBidFormData) => Promise<void>;
  onSaveDraft?: (data: RFQBidFormData) => Promise<void>;
  initialData?: Partial<RFQBidFormData>;
}

export function RFQBidForm({
  rfqId,
  items,
  lotId,
  onSubmit,
  onSaveDraft,
  initialData,
}: RFQBidFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Memoize defaultValues to prevent infinite re-renders
  const defaultValues = useMemo(() => initialData || {
    items: items.map((item) => ({
      solicitation_item_id: item.id,
      unit_price: "",
      total_price: "",
      quantity: item.quantity,
      item_name: item.item?.name || item.description || "",
      description: item.description || "",
    })),
    delivery_time: "",
    payment_terms: "",
    validity_period: "",
    currency: "NGN",
    warranty: "",
  }, [items, initialData]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    control,
  } = useForm<RFQBidFormData>({
    resolver: zodResolver(RFQBidSchema),
    defaultValues,
  });

  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  // Get total price for display (does NOT modify state - safe to call during render)
  const getTotalPriceForDisplay = (index: number): string => {
    const item = watchedItems[index];
    if (item.unit_price && item.quantity) {
      const unitPrice = parseFloat(item.unit_price);
      const totalPrice = (unitPrice * item.quantity).toFixed(2);
      return totalPrice;
    }
    return "0.00";
  };

  // Update total price in form state (modifies state - only call in event handlers)
  const updateTotalPrice = (index: number) => {
    const item = watchedItems[index];
    if (item.unit_price && item.quantity) {
      const unitPrice = parseFloat(item.unit_price);
      const totalPrice = (unitPrice * item.quantity).toFixed(2);
      setValue(`items.${index}.total_price`, totalPrice);
    }
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    return watchedItems.reduce((sum, item) => {
      if (item.unit_price && item.quantity) {
        const unitPrice = parseFloat(item.unit_price);
        return sum + (unitPrice * item.quantity);
      }
      return sum;
    }, 0).toFixed(2);
  };

  // Group items by lot if applicable
  const itemsByLot = items.reduce((acc, item) => {
    const lotName = item.lot?.name || "No Lot";
    if (!acc[lotName]) {
      acc[lotName] = [];
    }
    acc[lotName].push(item);
    return acc;
  }, {} as Record<string, SolicitationItem[]>);

  const handleFormSubmit = async (data: RFQBidFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success("Bid submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setIsSavingDraft(true);
    try {
      const data = watch();
      await onSaveDraft(data);
      toast.success("Draft saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* RFQ Items - Grouped by Lot */}
      {Object.entries(itemsByLot).map(([lotName, lotItems]) => (
        <Card key={lotName}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{lotName}</CardTitle>
                <CardDescription>
                  {lotItems.length} item{lotItems.length !== 1 ? 's' : ''} in this lot
                </CardDescription>
              </div>
              <Badge variant="secondary">{lotItems.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lotItems.map((item, lotItemIndex) => {
                const globalIndex = items.findIndex((i) => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 bg-gray-50 space-y-3"
                  >
                    {/* Item Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.item?.name || item.description}
                        </h4>
                        {item.description && item.item?.name !== item.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.description}
                          </p>
                        )}
                        {item.specification && (
                          <p className="text-xs text-gray-500 mt-1">
                            Spec: {item.specification}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        Qty: {item.quantity}
                      </Badge>
                    </div>

                    {/* Pricing Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`items.${globalIndex}.unit_price`}>
                          Unit Price (NGN) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`items.${globalIndex}.unit_price`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...register(`items.${globalIndex}.unit_price`)}
                          onBlur={() => updateTotalPrice(globalIndex)}
                          className={errors.items?.[globalIndex]?.unit_price ? "border-red-500" : ""}
                        />
                        {errors.items?.[globalIndex]?.unit_price && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.items[globalIndex]?.unit_price?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Total Price (NGN)</Label>
                        <div className="flex items-center h-10 px-3 bg-blue-50 border border-blue-200 rounded-md">
                          <Calculator className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-semibold text-blue-900">
                            {getTotalPriceForDisplay(globalIndex)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Grand Total */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-medium">Total Bid Amount</p>
              <p className="text-xs text-blue-600">Sum of all items</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-900">
                ₦{parseFloat(calculateGrandTotal()).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-blue-600">NGN</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bid Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Bid Terms & Conditions</CardTitle>
          <CardDescription>Provide the terms for your bid</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="delivery_time">
              Delivery Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="delivery_time"
              placeholder="e.g., 30 days from order confirmation"
              {...register("delivery_time")}
              className={errors.delivery_time ? "border-red-500" : ""}
            />
            {errors.delivery_time && (
              <p className="text-xs text-red-500 mt-1">{errors.delivery_time.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="payment_terms">
              Payment Terms <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="payment_terms"
              placeholder="e.g., 50% advance, 50% on delivery"
              rows={3}
              {...register("payment_terms")}
              className={errors.payment_terms ? "border-red-500" : ""}
            />
            {errors.payment_terms && (
              <p className="text-xs text-red-500 mt-1">{errors.payment_terms.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="validity_period">
              Bid Validity Period <span className="text-red-500">*</span>
            </Label>
            <Input
              id="validity_period"
              placeholder="e.g., 90 days from submission"
              {...register("validity_period")}
              className={errors.validity_period ? "border-red-500" : ""}
            />
            {errors.validity_period && (
              <p className="text-xs text-red-500 mt-1">{errors.validity_period.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="warranty">Warranty Terms (Optional)</Label>
            <Textarea
              id="warranty"
              placeholder="e.g., 12 months manufacturer warranty"
              rows={3}
              {...register("warranty")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Errors Alert */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the errors above before submitting your bid.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSavingDraft ? "Saving..." : "Save Draft"}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isSavingDraft}>
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Submitting..." : "Submit Bid"}
        </Button>
      </div>
    </form>
  );
}
