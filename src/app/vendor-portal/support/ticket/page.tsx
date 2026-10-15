"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  Paperclip,
  Calendar,
  Priority,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/Loading";
import { useToast } from "@/hooks/use-toast";
import {
  useVendorSupportTickets,
  useCreateSupportTicket,
  useSupportTicketsSummary,
} from "@/features/vendor-portal/controllers/vendorDashboardController";

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  issue_description: string;
  status: 'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'WAITING_RESPONSE' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'NORMAL' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'TECHNICAL' | 'BILLING' | 'RFQ_INQUIRY' | 'ACCOUNT' | 'PORTAL_ISSUE' | 'GENERAL';
  email: string;
  phone_number?: string;
  created_datetime: string;
  updated_datetime: string;
  assigned_to?: {
    name: string;
    email: string;
    role: string;
  } | null;
  responses_count: number;
  last_response_date?: string | null;
  last_response_by?: 'VENDOR' | 'SUPPORT' | null;
  resolution_date?: string | null;
}

export default function VendorSupportTicketsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    issue_description: "",
    category: "",
    priority: "NORMAL",
    email: "",
    phone_number: "",
  });

  // Fetch tickets from API
  const { data: ticketsData, isLoading, error, refetch } = useVendorSupportTickets({
    status: statusFilter === "all" ? undefined : statusFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
  });

  // Fetch summary statistics
  const { data: summaryData } = useSupportTicketsSummary();

  // Create ticket mutation
  const { mutate: createTicket, isPending: isCreating } = useCreateSupportTicket();

  const tickets: SupportTicket[] = ticketsData?.tickets || [];

  // Calculate counts from summary or fallback to filtering tickets
  const openTicketsCount = summaryData?.open_tickets || tickets.filter((t: any) => t.status === 'OPEN').length;
  const inProgressCount = summaryData?.in_progress || tickets.filter((t: any) => t.status === 'IN_PROGRESS').length;
  const waitingResponseCount = summaryData?.waiting_response || tickets.filter((t: any) => t.status === 'WAITING_RESPONSE').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'secondary';
      case 'WAITING_RESPONSE':
        return 'destructive';
      case 'RESOLVED':
        return 'outline';
      case 'CLOSED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'WAITING_RESPONSE':
        return <MessageCircle className="h-4 w-4" />;
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CLOSED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Ticket className="h-4 w-4" />;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const names = {
      'TECHNICAL': 'Technical Issue',
      'BILLING': 'Billing & Payments',
      'RFQ_INQUIRY': 'RFQ Inquiry',
      'ACCOUNT': 'Account Access',
      'PORTAL_ISSUE': 'Portal Issue',
      'GENERAL': 'General Support'
    };
    return names[category as keyof typeof names] || category;
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.issue_description.toLowerCase().includes(searchTerm.toLowerCase());
    // Status and category filters already applied in API call
    return matchesSearch;
  });

  const handleCreateTicket = () => {
    if (!formData.subject || !formData.issue_description || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createTicket(formData, {
      onSuccess: (data) => {
        toast({
          title: "Success!",
          description: data.message || "Support ticket created successfully",
        });
        setShowCreateTicket(false);
        setFormData({
          subject: "",
          issue_description: "",
          category: "",
          priority: "NORMAL",
          email: "",
          phone_number: "",
        });
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to create ticket",
          variant: "destructive",
        });
      },
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="h-8 w-8" />
            Support Tickets
            {(openTicketsCount + inProgressCount + waitingResponseCount) > 0 && (
              <Badge variant="destructive" className="ml-2">
                {openTicketsCount + inProgressCount + waitingResponseCount} active
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage your support requests and get help from our team
          </p>
        </div>
        <Button onClick={() => setShowCreateTicket(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Create Ticket
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{openTicketsCount}</p>
            <p className="text-sm text-blue-800">Open Tickets</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{inProgressCount}</p>
            <p className="text-sm text-orange-800">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <MessageCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{waitingResponseCount}</p>
            <p className="text-sm text-red-800">Awaiting Response</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {summaryData?.resolved || tickets.filter((t: any) => t.status === 'RESOLVED' || t.status === 'CLOSED').length}
            </p>
            <p className="text-sm text-green-800">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Ticket Form */}
      {showCreateTicket && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Support Ticket</CardTitle>
            <CardDescription>
              Describe your issue and our support team will assist you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TECHNICAL">Technical Issue</SelectItem>
                      <SelectItem value="BILLING">Billing & Payments</SelectItem>
                      <SelectItem value="RFQ_INQUIRY">RFQ Inquiry</SelectItem>
                      <SelectItem value="ACCOUNT">Account Access</SelectItem>
                      <SelectItem value="PORTAL_ISSUE">Portal Issue</SelectItem>
                      <SelectItem value="GENERAL">General Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="issue_description">Description *</Label>
                  <Textarea
                    id="issue_description"
                    placeholder="Please provide detailed information about your issue..."
                    value={formData.issue_description}
                    onChange={(e) => setFormData({...formData, issue_description: e.target.value})}
                    rows={6}
                  />
                </div>
                <div>
                  <Label>Attachments (Optional)</Label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG, DOC up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateTicket(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTicket}>
                Create Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets by subject, number, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="WAITING_RESPONSE">Awaiting Response</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="TECHNICAL">Technical Issue</SelectItem>
                  <SelectItem value="BILLING">Billing & Payments</SelectItem>
                  <SelectItem value="RFQ_INQUIRY">RFQ Inquiry</SelectItem>
                  <SelectItem value="ACCOUNT">Account Access</SelectItem>
                  <SelectItem value="PORTAL_ISSUE">Portal Issue</SelectItem>
                  <SelectItem value="GENERAL">General Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                ticket.status === 'WAITING_RESPONSE' ? 'border-l-4 border-l-red-500' :
                ticket.status === 'IN_PROGRESS' ? 'border-l-4 border-l-orange-500' :
                ticket.status === 'OPEN' ? 'border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => router.push(`/vendor-portal/support/tickets/${ticket.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(ticket.status)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ticket.subject}
                      </h3>
                      <Badge variant={getStatusBadgeVariant(ticket.status)} className="capitalize">
                        {ticket.status.replace('_', ' ').toLowerCase()}
                      </Badge>
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="capitalize">
                        {ticket.priority.toLowerCase()}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      <strong>#{ticket.ticket_number}</strong> • {getCategoryDisplayName(ticket.category)}
                    </p>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {ticket.issue_description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {formatDate(ticket.created_datetime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Updated: {formatDate(ticket.updated_datetime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{ticket.responses_count} responses</span>
                      </div>
                      {ticket.assigned_to && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>Assigned to: {ticket.assigned_to.name}</span>
                        </div>
                      )}
                    </div>

                    {ticket.last_response_date && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">
                          Last response: {formatDate(ticket.last_response_date)} by {ticket.last_response_by?.toLowerCase()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/vendor-portal/support/tickets/${ticket.id}`);
                      }}
                      size="sm"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Ticket className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "You don't have any support tickets yet. Create one if you need help."}
              </p>
              {(searchTerm || statusFilter !== "all" || categoryFilter !== "all") ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => setShowCreateTicket(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create First Ticket
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}