"use client";

import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MousePointer,
} from "lucide-react";
import type { Subscription } from "@/lib/types";
import { useSubscriptions } from "@/contexts/subscription-context";
import { CATEGORY_ICONS } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { EditSubscriptionDialog } from "@/components/subsight/subscription-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  simulation: Record<string, boolean>;
  setSimulation: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function SubscriptionsTable({
  subscriptions,
  simulation,
  setSimulation,
}: SubscriptionsTableProps) {
  const { deleteSubscription, incrementUsage } = useSubscriptions();
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleSimToggle = useCallback(
    (id: string, checked: boolean) => {
      setSimulation((prev) => ({ ...prev, [id]: checked }));
    },
    [setSimulation]
  );

  const getIconForSubscription = useCallback((sub: Subscription) => {
    return CATEGORY_ICONS[sub.icon] || CATEGORY_ICONS.default;
  }, []);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(subscriptions.map(sub => sub.category)));
    return uniqueCategories.sort();
  }, [subscriptions]);

  // Filter subscriptions based on search and filters
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sub.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sub.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || sub.category === categoryFilter;
      
      const simulatedStatus = simulation[sub.id] !== undefined ? simulation[sub.id] : sub.activeStatus;
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && simulatedStatus) ||
                           (statusFilter === "inactive" && !simulatedStatus);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [subscriptions, searchTerm, categoryFilter, statusFilter, simulation]);

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No Subscriptions Yet</h3>
            <p className="text-muted-foreground mt-2">
              Click "Add Subscription" to start tracking.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>My Subscriptions</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No subscriptions match your filters.</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Active</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Billing Cycle</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead className="w-12">Renew</TableHead>
                      <TableHead className="w-12">Usage</TableHead>
                      <TableHead className="w-12 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((sub) => {
                      const isSimulated = simulation[sub.id] !== undefined;
                      const simulatedStatus = isSimulated
                        ? simulation[sub.id]
                        : sub.activeStatus;
                      const Icon = getIconForSubscription(sub);

                      return (
                        <TableRow
                          key={sub.id}
                          data-state={simulatedStatus ? "" : "disabled"}
                        >
                          <TableCell>
                            <Checkbox
                              checked={simulatedStatus}
                              onCheckedChange={(checked) =>
                                handleSimToggle(sub.id, !!checked)
                              }
                              aria-label={`Toggle activation for ${sub.name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium flex items-center gap-2">
                            <Icon className="w-5 h-5 text-foreground" />
                            {sub.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{sub.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {sub.amount.toLocaleString("en-US", {
                              style: "currency",
                              currency: sub.currency,
                            })}
                          </TableCell>
                          <TableCell className="capitalize">
                            {sub.billingCycle}
                          </TableCell>
                          <TableCell>
                            {format(new Date(sub.startDate), "PP")}
                          </TableCell>
                          <TableCell>
                            {sub.autoRenew ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => incrementUsage(sub.id)}
                                title="Mark as used"
                              >
                                <MousePointer className="h-3 w-3" />
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                {sub.usageCount || 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setEditingSub(sub)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete your subscription.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteSubscription(sub.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="grid gap-4 md:hidden">
                {filteredSubscriptions.map((sub, index) => {
                  const isSimulated = simulation[sub.id] !== undefined;
                  const simulatedStatus = isSimulated
                    ? simulation[sub.id]
                    : sub.activeStatus;
                  const Icon = getIconForSubscription(sub);
                  return (
                    <div
                      key={sub.id}
                      className="border-b pb-4 last:border-b-0 last:pb-0 space-y-3"
                      data-state={simulatedStatus ? "" : "disabled"}
                    >
                      <div className="flex items-center justify-between pt-4">
                        <div className="font-medium flex items-center gap-2">
                          <Icon className="w-5 h-5 text-foreground" />
                          {sub.name}
                        </div>
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingSub(sub)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently
                                delete your subscription.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSubscription(sub.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="secondary">{sub.category}</Badge>
                        <div>
                          <span className="font-semibold">
                            {sub.amount.toLocaleString("en-US", {
                              style: "currency",
                              currency: sub.currency,
                            })}
                          </span>
                          <span className="text-muted-foreground capitalize">
                            /{sub.billingCycle.slice(0, 2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Started: {format(new Date(sub.startDate), "PP")}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>Renews:</span>
                          {sub.autoRenew ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                          id={`sim-toggle-${sub.id}`}
                          checked={simulatedStatus}
                          onCheckedChange={(checked) =>
                            handleSimToggle(sub.id, !!checked)
                          }
                        />
                        <label htmlFor={`sim-toggle-${sub.id}`} className="text-sm">
                          Active
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {editingSub && (
        <EditSubscriptionDialog
          isOpen={!!editingSub}
          onOpenChange={(open) => !open && setEditingSub(null)}
          subscription={editingSub}
        />
      )}
    </>
  );
}
