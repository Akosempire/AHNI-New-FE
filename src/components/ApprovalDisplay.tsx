import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import ApprovalProgress, { toStepState } from './ux/ApprovalProgress';
import { CheckCircle, Clock, XCircle, AlertCircle, UserIcon, CalendarIcon } from 'lucide-react';

export interface ApprovalInfo {
  id?: string;
  name: string;
  position: string;
  email?: string;
  avatar?: string;
  approvalDate?: string;
  reviewDate?: string;
  creationDate?: string;
  authorizationDate?: string;
  signDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  comments?: string;
  level?: string;
}

interface ApprovalDisplayProps {
  approvals: ApprovalInfo[];
  title?: string;
  showTimeline?: boolean;
  className?: string;
}

const ApprovalDisplay: React.FC<ApprovalDisplayProps> = ({
  approvals,
  title = "Approval Status",
  showTimeline = false,
  className
}) => {
  const getStatusIcon = (status: ApprovalInfo['status']) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'UNDER_REVIEW':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'PENDING':
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: ApprovalInfo['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const progress = approvals.length > 1 && (
    <ApprovalProgress
      className="pt-3"
      steps={approvals.map((a) => ({
        label: a.level || a.position || a.name,
        sub: a.level || a.position ? a.name : undefined,
        state: toStepState(a.status),
      }))}
    />
  );

  if (showTimeline) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {progress}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {approvals.map((approval, index) => (
              <div key={approval.id || index} className="relative">
                {/* Timeline line */}
                {index < approvals.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                )}

                <div className="flex items-start space-x-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(approval.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                          {approval.avatar ? (
                            <img
                              src={approval.avatar}
                              alt={approval.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{approval.name}</h4>
                          <p className="text-xs text-gray-600">{approval.position}</p>
                          {approval.level && (
                            <p className="text-xs text-gray-500">{approval.level}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(approval.status)}>
                        {approval.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-2">
                      {approval.creationDate && (
                        <div>
                          <span className="font-medium">Created:</span>
                          <br />
                          {formatDate(approval.creationDate)}
                        </div>
                      )}
                      {approval.reviewDate && (
                        <div>
                          <span className="font-medium">Reviewed:</span>
                          <br />
                          {formatDate(approval.reviewDate)}
                        </div>
                      )}
                      {approval.approvalDate && (
                        <div>
                          <span className="font-medium">Approved:</span>
                          <br />
                          {formatDate(approval.approvalDate)}
                        </div>
                      )}
                      {approval.authorizationDate && (
                        <div>
                          <span className="font-medium">Authorized:</span>
                          <br />
                          {formatDate(approval.authorizationDate)}
                        </div>
                      )}
                    </div>

                    {/* Comments */}
                    {approval.comments && (
                      <div className="bg-gray-50 rounded-md p-2 text-xs text-gray-700">
                        <span className="font-medium">Comments: </span>
                        {approval.comments}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Non-timeline view
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {progress}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvals.map((approval, index) => (
            <div
              key={approval.id || index}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
                  {approval.avatar ? (
                    <img
                      src={approval.avatar}
                      alt={approval.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{approval.name}</h4>
                  <p className="text-sm text-gray-600">{approval.position}</p>
                  {approval.level && (
                    <p className="text-xs text-gray-500">{approval.level}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(approval.status)}>
                  {approval.status.replace('_', ' ')}
                </Badge>
                {approval.approvalDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(approval.approvalDate)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalDisplay;