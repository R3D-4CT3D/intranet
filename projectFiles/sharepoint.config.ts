// src/services/sharepoint.config.ts

export const SharePointConfig = {
  lists: {
    purchaseRequests: {
      title: 'PurchaseRequests',
      fields: {
        Title: 'Title',
        DepartmentArea: 'DepartmentArea',
        Category: 'Category',
        ItemDescription: 'ItemDescription',
        ItemLink: 'ItemLink',
        FundingSource: 'FundingSource',
        FundingSourceOther: 'FundingSourceOther',
        Requester: 'Requester',
        Purchaser: 'Purchaser',
        OtherComments: 'OtherComments',
        Status: 'Status',
        DateSubmitted: 'DateSubmitted',
        DateCompleted: 'DateCompleted',
        EstimatedCost: 'EstimatedCost'
      }
    },
    supportRequests: {
      title: 'SupportRequests',
      fields: {
        Title: 'Title',
        RequestType: 'RequestType',
        DepartmentArea: 'DepartmentArea',
        Category: 'Category',
        Details: 'Details',
        Priority: 'Priority',
        Status: 'Status',
        AssignedTo: 'AssignedTo',
        NeedByDate: 'NeedByDate',
        CreatedBy: 'Author',
        CreationDate: 'Created',
        ResolvedDate: 'ResolvedDate',
        ResolutionNotes: 'ResolutionNotes',
        Attachments: 'Attachments'
      }
    },
    news: {
      title: 'NewsAnnouncements',
      fields: {
        Title: 'Title',
        Content: 'Content',
        Link: 'Link',
        PublishedDate: 'PublishedDate',
        ExpirationDate: 'ExpirationDate',
        Author: 'Author'
      }
    },
    departmentStats: {
      title: 'DepartmentStats',
      fields: {
        Title: 'Title',
        TotalEnrollments: 'TotalEnrollments',
        UndergradEnrollments: 'UndergradEnrollments',
        GradEnrollments: 'GradEnrollments',
        FacultyCount: 'FacultyCount',
        LastUpdated: 'LastUpdated'
      }
    }
  },
  
  choices: {
    departmentAreas: [
      'Animation',
      'Graphic Design',
      'Photography',
      'Illustration',
      'Art History',
      'Painting/Drawing',
      'Sculpture',
      'Ceramics',
      'Other'
    ],
    
    purchaseCategories: [
      'Hardware',
      'Software',
      'Furniture',
      'Supplies',
      'Other'
    ],
    
    fundingSources: [
      'IRA',
      'Lottery',
      'Department',
      'Other'
    ],
    
    purchaseStatuses: [
      'Submitted',
      'Under Review',
      'Approved',
      'Ordered',
      'Received',
      'Denied'
    ],
    
    requestTypes: [
      'Issue',
      'Request',
      'Other'
    ],
    
    supportCategories: [
      'Equipment',
      'Facilities',
      'Supplies',
      'Event',
      'Other'
    ],
    
    priorities: [
      'Low',
      'Medium',
      'High',
      'Critical'
    ],
    
    supportStatuses: [
      'Open',
      'In Progress',
      'Resolved',
      'Closed'
    ]
  },
  
  calendar: {
    name: 'CSUN Art & Design Service Portal'
  }
};

// TypeScript Interfaces
export interface IPurchaseRequest {
  Id?: number;
  Title: string;
  DepartmentArea: string;
  Category: string;
  ItemDescription: string;
  ItemLink?: string;
  FundingSource: string;
  FundingSourceOther?: string;
  Requester: { Title: string; EMail: string };
  Purchaser?: { Title: string; EMail: string };
  OtherComments?: string;
  Status: string;
  DateSubmitted: Date;
  DateCompleted?: Date;
  EstimatedCost?: number;
}

export interface ISupportRequest {
  Id?: number;
  Title: string;
  RequestType: string;
  DepartmentArea: string;
  Category: string;
  Details: string;
  Priority: string;
  Status: string;
  AssignedTo?: { Title: string; EMail: string };
  NeedByDate?: Date;
  CreatedBy: { Title: string; EMail: string };
  CreationDate: Date;
  ResolvedDate?: Date;
  ResolutionNotes?: string;
  Attachments?: any[];
}

export interface INewsItem {
  Id?: number;
  Title: string;
  Content: string;
  Link?: string;
  PublishedDate: Date;
  ExpirationDate?: Date;
  Author: { Title: string; EMail: string };
}

export interface IDepartmentStats {
  Id?: number;
  Title: string;
  TotalEnrollments: number;
  UndergradEnrollments: number;
  GradEnrollments: number;
  FacultyCount: number;
  LastUpdated: Date;
}

export interface ICalendarEvent {
  Id?: number;
  Title: string;
  EventDate: Date;
  EndDate: Date;
  Location?: string;
  Description?: string;
  Category?: string;
  fAllDayEvent: boolean;
}
