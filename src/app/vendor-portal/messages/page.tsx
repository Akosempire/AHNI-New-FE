"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageCircle,
  Send,
  Search,
  Filter,
  Mail,
  MailOpen,
  Clock,
  AlertCircle,
  FileText,
  User,
  Plus,
  Reply,
  Paperclip,
  Star,
  Archive,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/Loading";
import { useToast } from "@/hooks/use-toast";
import {
  useVendorMessages,
  useReplyToMessage,
  useMarkMessageRead,
  useArchiveMessage,
  useSendVendorMessage,
} from "@/features/vendor-portal/controllers/vendorDashboardController";

interface Message {
  id: string;
  subject: string;
  sender: {
    name?: string;
    email: string;
    role?: string;
  };
  recipient: {
    name?: string;
    email: string;
  };
  message: string;
  created_datetime: string;
  read_at?: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  related_solicitation?: {
    id: string;
    rfq_id: string;
    title: string;
  };
  related_purchase_order?: {
    id: string;
    purchase_order_number: string;
  };
  attachments?: Array<{
    id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    file_url: string;
  }>;
  replies?: Message[];
  thread_id?: string;
  parent_message?: string;
  is_from_vendor: boolean;
}

export default function VendorMessagesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  // Compose form state
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composePriority, setComposePriority] = useState("NORMAL");

  // Fetch messages from API
  const { data: messagesData, isLoading, error, refetch } = useVendorMessages({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  // Mutations
  const { mutate: sendMessage, isPending: isSending } = useSendVendorMessage();
  const { mutate: replyToMessage, isPending: isReplying } = useReplyToMessage();
  const { mutate: markAsRead } = useMarkMessageRead();
  const { mutate: archiveMessage } = useArchiveMessage();

  const messages: Message[] = Array.isArray(messagesData) ? messagesData : messagesData?.results || [];

  // Mark message as read when selected
  useEffect(() => {
    if (selectedMessage && selectedMessage.status === 'UNREAD') {
      markAsRead(selectedMessage.id);
    }
  }, [selectedMessage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'UNREAD':
        return 'default';
      case 'READ':
        return 'secondary';
      case 'ARCHIVED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'destructive';
      case 'HIGH':
        return 'default';
      case 'NORMAL':
        return 'secondary';
      case 'LOW':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getMessageType = (message: Message) => {
    if (message.related_solicitation) return 'rfq_clarification';
    if (message.related_purchase_order) return 'contract';
    return 'inquiry';
  };

  const getTypeIcon = (message: Message) => {
    const type = getMessageType(message);
    switch (type) {
      case 'rfq_clarification':
        return <FileText className="h-4 w-4" />;
      case 'contract':
        return <FileText className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || message.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter((m: any) => m.status === 'UNREAD').length;

  const handleSendReply = () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    replyToMessage(
      {
        messageId: selectedMessage.id,
        message: replyContent,
        priority: selectedMessage.priority,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Reply sent successfully",
          });
          setReplyContent("");
          refetch();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to send reply",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleSendNewMessage = () => {
    if (!composeSubject.trim() || !composeMessage.trim()) {
      toast({
        title: "Error",
        description: "Please fill in subject and message",
        variant: "destructive",
      });
      return;
    }

    sendMessage(
      {
        subject: composeSubject,
        message: composeMessage,
        priority: composePriority,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Message sent successfully",
          });
          setShowCompose(false);
          setComposeSubject("");
          setComposeMessage("");
          setComposePriority("NORMAL");
          refetch();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to send message",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleArchive = (messageId: string) => {
    archiveMessage(messageId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Message archived",
        });
        setSelectedMessage(null);
        refetch();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to archive message",
          variant: "destructive",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2">Loading messages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load messages. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="h-8 w-8" />
            Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Communicate with AHNI procurement team and manage your correspondence
          </p>
        </div>
        <Button onClick={() => setShowCompose(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Message
        </Button>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <Card>
          <CardHeader>
            <CardTitle>New Message</CardTitle>
            <CardDescription>Send a message to AHNI procurement team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter message subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={composePriority} onValueChange={setComposePriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="compose-message">Message</Label>
              <Textarea
                id="compose-message"
                placeholder="Type your message here..."
                value={composeMessage}
                onChange={(e) => setComposeMessage(e.target.value)}
                rows={6}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSendNewMessage} disabled={isSending}>
                <Send className="h-4 w-4 mr-1" />
                {isSending ? "Sending..." : "Send Message"}
              </Button>
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
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
                  placeholder="Search messages by subject, sender, or content..."
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
                  <SelectItem value="UNREAD">Unread</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Inbox</h2>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs">
                {filteredMessages.length} total
              </Badge>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </div>

          {filteredMessages.length > 0 ? (
            <div className="space-y-2">
              {filteredMessages.map((message) => (
                <Card
                  key={message.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMessage?.id === message.id ? 'ring-2 ring-blue-500' : ''
                  } ${
                    message.status === 'UNREAD' ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(message)}
                        {message.status === 'UNREAD' ? (
                          <Mail className="h-4 w-4 text-blue-600" />
                        ) : (
                          <MailOpen className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <Badge variant={getPriorityBadgeVariant(message.priority)} className="text-xs">
                        {message.priority.toLowerCase()}
                      </Badge>
                    </div>

                    <h3 className={`font-semibold text-sm mb-1 line-clamp-2 ${
                      message.status === 'UNREAD' ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {message.subject}
                    </h3>

                    <p className="text-xs text-gray-600 mb-2">
                      From: {message.sender.name || message.sender.email}
                    </p>

                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {message.message}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(message.created_datetime)}
                      </span>
                      {message.replies && message.replies.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {message.replies.length + 1}
                        </span>
                      )}
                      {message.attachments && message.attachments.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          {message.attachments.length}
                        </span>
                      )}
                    </div>

                    {message.related_solicitation && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {message.related_solicitation.rfq_id}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search criteria or filters"
                    : "You don't have any messages yet"}
                </p>
                {(searchTerm || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Message Details */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {getTypeIcon(selectedMessage)}
                      {selectedMessage.subject}
                      {selectedMessage.status === 'UNREAD' && (
                        <Badge variant="destructive" className="text-xs">New</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {selectedMessage.sender.name || selectedMessage.sender.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(selectedMessage.created_datetime)}
                      </span>
                      <Badge variant={getPriorityBadgeVariant(selectedMessage.priority)} className="text-xs">
                        {selectedMessage.priority.toLowerCase()} priority
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(selectedMessage.id)}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedMessage.related_solicitation && (
                  <Alert className="mb-4">
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      This message relates to <strong>{selectedMessage.related_solicitation.rfq_id}</strong> - {selectedMessage.related_solicitation.title}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="prose max-w-none mb-6">
                  <div className="whitespace-pre-wrap text-gray-900">
                    {selectedMessage.message}
                  </div>
                </div>

                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Attachments ({selectedMessage.attachments.length})</h4>
                    <div className="space-y-2">
                      {selectedMessage.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-3 p-2 border rounded-lg">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{attachment.file_name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(attachment.file_size)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(attachment.file_url, '_blank')}
                          >
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reply">Reply</Label>
                      <Textarea
                        id="reply"
                        placeholder="Type your reply here..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleSendReply} disabled={isReplying}>
                        <Send className="h-4 w-4 mr-1" />
                        {isReplying ? "Sending..." : "Send Reply"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-24 text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Message</h3>
                <p className="text-gray-500">
                  Choose a message from the list to view its contents and reply
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Message Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Message Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{messages.length}</p>
              <p className="text-sm text-blue-800">Total Messages</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
              <p className="text-sm text-orange-800">Unread</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {messages.filter((m: any) => m.related_solicitation).length}
              </p>
              <p className="text-sm text-green-800">RFQ Related</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {messages.filter((m: any) => m.priority === 'URGENT' || m.priority === 'HIGH').length}
              </p>
              <p className="text-sm text-purple-800">High Priority</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
