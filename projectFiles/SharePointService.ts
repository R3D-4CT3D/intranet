// src/services/SharePointService.ts

import { WebPartContext } from '@microsoft/sp-webpart-base';
import { sp } from '@pnp/sp/presets/all';
import { 
  SharePointConfig, 
  IPurchaseRequest, 
  ISupportRequest, 
  INewsItem, 
  IDepartmentStats,
  ICalendarEvent 
} from './sharepoint.config';

export class SharePointService {
  
  constructor(private context: WebPartContext) {
    sp.setup({
      spfxContext: this.context
    });
  }

  // ==================== PURCHASE REQUESTS ====================
  
  public async createPurchaseRequest(request: IPurchaseRequest): Promise<number> {
    const listName = SharePointConfig.lists.purchaseRequests.title;
    
    const item = await sp.web.lists.getByTitle(listName).items.add({
      Title: request.Title,
      DepartmentArea: request.DepartmentArea,
      Category: request.Category,
      ItemDescription: request.ItemDescription,
      ItemLink: request.ItemLink ? { Url: request.ItemLink, Description: request.Title } : null,
      FundingSource: request.FundingSource,
      FundingSourceOther: request.FundingSourceOther,
      RequesterId: request.Requester ? await this.getUserId(request.Requester.EMail) : null,
      PurchaserId: request.Purchaser ? await this.getUserId(request.Purchaser.EMail) : null,
      OtherComments: request.OtherComments,
      Status: 'Submitted',
      DateSubmitted: new Date(),
      EstimatedCost: request.EstimatedCost
    });

    return item.data.Id;
  }

  public async getPurchaseRequests(filter?: string): Promise<IPurchaseRequest[]> {
    const listName = SharePointConfig.lists.purchaseRequests.title;
    
    let query = sp.web.lists.getByTitle(listName).items
      .select('*', 'Requester/Title', 'Requester/EMail', 'Purchaser/Title', 'Purchaser/EMail')
      .expand('Requester', 'Purchaser')
      .orderBy('DateSubmitted', false);
    
    if (filter) {
      query = query.filter(filter);
    }

    const items = await query.get();
    
    return items.map(item => ({
      Id: item.Id,
      Title: item.Title,
      DepartmentArea: item.DepartmentArea,
      Category: item.Category,
      ItemDescription: item.ItemDescription,
      ItemLink: item.ItemLink?.Url,
      FundingSource: item.FundingSource,
      FundingSourceOther: item.FundingSourceOther,
      Requester: item.Requester ? { Title: item.Requester.Title, EMail: item.Requester.EMail } : null,
      Purchaser: item.Purchaser ? { Title: item.Purchaser.Title, EMail: item.Purchaser.EMail } : null,
      OtherComments: item.OtherComments,
      Status: item.Status,
      DateSubmitted: new Date(item.DateSubmitted),
      DateCompleted: item.DateCompleted ? new Date(item.DateCompleted) : null,
      EstimatedCost: item.EstimatedCost
    }));
  }

  public async updatePurchaseRequest(id: number, updates: Partial<IPurchaseRequest>): Promise<void> {
    const listName = SharePointConfig.lists.purchaseRequests.title;
    
    const updateObj: any = {};
    
    if (updates.Status) updateObj.Status = updates.Status;
    if (updates.Purchaser) updateObj.PurchaserId = await this.getUserId(updates.Purchaser.EMail);
    if (updates.DateCompleted) updateObj.DateCompleted = updates.DateCompleted;
    if (updates.OtherComments) updateObj.OtherComments = updates.OtherComments;
    if (updates.EstimatedCost) updateObj.EstimatedCost = updates.EstimatedCost;

    await sp.web.lists.getByTitle(listName).items.getById(id).update(updateObj);
  }

  public async deletePurchaseRequest(id: number): Promise<void> {
    const listName = SharePointConfig.lists.purchaseRequests.title;
    await sp.web.lists.getByTitle(listName).items.getById(id).delete();
  }

  // ==================== SUPPORT REQUESTS ====================
  
  public async createSupportRequest(request: ISupportRequest): Promise<number> {
    const listName = SharePointConfig.lists.supportRequests.title;
    
    const item = await sp.web.lists.getByTitle(listName).items.add({
      Title: request.Title,
      RequestType: request.RequestType,
      DepartmentArea: request.DepartmentArea,
      Category: request.Category,
      Details: request.Details,
      Priority: request.Priority,
      Status: 'Open',
      AssignedToId: request.AssignedTo ? await this.getUserId(request.AssignedTo.EMail) : null,
      NeedByDate: request.NeedByDate
    });

    return item.data.Id;
  }

  public async getSupportRequests(filter?: string): Promise<ISupportRequest[]> {
    const listName = SharePointConfig.lists.supportRequests.title;
    
    let query = sp.web.lists.getByTitle(listName).items
      .select('*', 'Author/Title', 'Author/EMail', 'AssignedTo/Title', 'AssignedTo/EMail', 'Attachments', 'AttachmentFiles')
      .expand('Author', 'AssignedTo', 'AttachmentFiles')
      .orderBy('Created', false);
    
    if (filter) {
      query = query.filter(filter);
    }

    const items = await query.get();
    
    return items.map(item => ({
      Id: item.Id,
      Title: item.Title,
      RequestType: item.RequestType,
      DepartmentArea: item.DepartmentArea,
      Category: item.Category,
      Details: item.Details,
      Priority: item.Priority,
      Status: item.Status,
      AssignedTo: item.AssignedTo ? { Title: item.AssignedTo.Title, EMail: item.AssignedTo.EMail } : null,
      NeedByDate: item.NeedByDate ? new Date(item.NeedByDate) : null,
      CreatedBy: { Title: item.Author.Title, EMail: item.Author.EMail },
      CreationDate: new Date(item.Created),
      ResolvedDate: item.ResolvedDate ? new Date(item.ResolvedDate) : null,
      ResolutionNotes: item.ResolutionNotes,
      Attachments: item.AttachmentFiles
    }));
  }

  public async updateSupportRequest(id: number, updates: Partial<ISupportRequest>): Promise<void> {
    const listName = SharePointConfig.lists.supportRequests.title;
    
    const updateObj: any = {};
    
    if (updates.Status) updateObj.Status = updates.Status;
    if (updates.Priority) updateObj.Priority = updates.Priority;
    if (updates.AssignedTo) updateObj.AssignedToId = await this.getUserId(updates.AssignedTo.EMail);
    if (updates.ResolutionNotes) updateObj.ResolutionNotes = updates.ResolutionNotes;
    if (updates.ResolvedDate) updateObj.ResolvedDate = updates.ResolvedDate;

    await sp.web.lists.getByTitle(listName).items.getById(id).update(updateObj);
  }

  public async addAttachmentToSupportRequest(id: number, fileName: string, file: ArrayBuffer): Promise<void> {
    const listName = SharePointConfig.lists.supportRequests.title;
    await sp.web.lists.getByTitle(listName).items.getById(id).attachmentFiles.add(fileName, file);
  }

  public async deleteSupportRequest(id: number): Promise<void> {
    const listName = SharePointConfig.lists.supportRequests.title;
    await sp.web.lists.getByTitle(listName).items.getById(id).delete();
  }

  // ==================== NEWS & ANNOUNCEMENTS ====================
  
  public async createNewsItem(news: INewsItem): Promise<number> {
    const listName = SharePointConfig.lists.news.title;
    
    const item = await sp.web.lists.getByTitle(listName).items.add({
      Title: news.Title,
      Content: news.Content,
      Link: news.Link ? { Url: news.Link, Description: news.Title } : null,
      PublishedDate: news.PublishedDate || new Date(),
      ExpirationDate: news.ExpirationDate
    });

    return item.data.Id;
  }

  public async getNewsItems(includeExpired: boolean = false): Promise<INewsItem[]> {
    const listName = SharePointConfig.lists.news.title;
    
    let query = sp.web.lists.getByTitle(listName).items
      .select('*', 'Author/Title', 'Author/EMail')
      .expand('Author')
      .orderBy('PublishedDate', false);
    
    if (!includeExpired) {
      const today = new Date().toISOString();
      query = query.filter(`(ExpirationDate eq null) or (ExpirationDate ge datetime'${today}')`);
    }

    const items = await query.get();
    
    return items.map(item => ({
      Id: item.Id,
      Title: item.Title,
      Content: item.Content,
      Link: item.Link?.Url,
      PublishedDate: new Date(item.PublishedDate),
      ExpirationDate: item.ExpirationDate ? new Date(item.ExpirationDate) : null,
      Author: { Title: item.Author.Title, EMail: item.Author.EMail }
    }));
  }

  public async updateNewsItem(id: number, updates: Partial<INewsItem>): Promise<void> {
    const listName = SharePointConfig.lists.news.title;
    
    const updateObj: any = {};
    
    if (updates.Title) updateObj.Title = updates.Title;
    if (updates.Content) updateObj.Content = updates.Content;
    if (updates.Link !== undefined) updateObj.Link = updates.Link ? { Url: updates.Link, Description: updates.Title } : null;
    if (updates.ExpirationDate !== undefined) updateObj.ExpirationDate = updates.ExpirationDate;

    await sp.web.lists.getByTitle(listName).items.getById(id).update(updateObj);
  }

  public async deleteNewsItem(id: number): Promise<void> {
    const listName = SharePointConfig.lists.news.title;
    await sp.web.lists.getByTitle(listName).items.getById(id).delete();
  }

  // ==================== DEPARTMENT STATS ====================
  
  public async getDepartmentStats(): Promise<IDepartmentStats | null> {
    const listName = SharePointConfig.lists.departmentStats.title;
    
    const items = await sp.web.lists.getByTitle(listName).items
      .orderBy('LastUpdated', false)
      .top(1)
      .get();
    
    if (items.length === 0) return null;
    
    const item = items[0];
    return {
      Id: item.Id,
      Title: item.Title,
      TotalEnrollments: item.TotalEnrollments,
      UndergradEnrollments: item.UndergradEnrollments,
      GradEnrollments: item.GradEnrollments,
      FacultyCount: item.FacultyCount,
      LastUpdated: new Date(item.LastUpdated)
    };
  }

  public async updateDepartmentStats(stats: Partial<IDepartmentStats>): Promise<void> {
    const listName = SharePointConfig.lists.departmentStats.title;
    
    const items = await sp.web.lists.getByTitle(listName).items.top(1).get();
    
    const updateObj = {
      ...stats,
      LastUpdated: new Date()
    };
    
    if (items.length > 0) {
      await sp.web.lists.getByTitle(listName).items.getById(items[0].Id).update(updateObj);
    } else {
      await sp.web.lists.getByTitle(listName).items.add(updateObj);
    }
  }

  // ==================== CALENDAR EVENTS ====================
  
  public async getCalendarEvents(startDate?: Date, endDate?: Date): Promise<ICalendarEvent[]> {
    const calendarName = SharePointConfig.calendar.name;
    
    let query = sp.web.lists.getByTitle(calendarName).items
      .select('*')
      .orderBy('EventDate', true);
    
    if (startDate && endDate) {
      const start = startDate.toISOString();
      const end = endDate.toISOString();
      query = query.filter(`EventDate ge datetime'${start}' and EventDate le datetime'${end}'`);
    } else if (startDate) {
      const start = startDate.toISOString();
      query = query.filter(`EventDate ge datetime'${start}'`);
    }

    const items = await query.get();
    
    return items.map(item => ({
      Id: item.Id,
      Title: item.Title,
      EventDate: new Date(item.EventDate),
      EndDate: new Date(item.EndDate),
      Location: item.Location,
      Description: item.Description,
      Category: item.Category,
      fAllDayEvent: item.fAllDayEvent
    }));
  }

  public async createCalendarEvent(event: ICalendarEvent): Promise<number> {
    const calendarName = SharePointConfig.calendar.name;
    
    const item = await sp.web.lists.getByTitle(calendarName).items.add({
      Title: event.Title,
      EventDate: event.EventDate,
      EndDate: event.EndDate,
      Location: event.Location,
      Description: event.Description,
      Category: event.Category,
      fAllDayEvent: event.fAllDayEvent
    });

    return item.data.Id;
  }

  // ==================== HELPER METHODS ====================
  
  private async getUserId(email: string): Promise<number> {
    const user = await sp.web.ensureUser(email);
    return user.data.Id;
  }

  public async getCurrentUser(): Promise<{ Title: string; EMail: string }> {
    const user = await sp.web.currentUser.get();
    return {
      Title: user.Title,
      EMail: user.Email
    };
  }

  // ==================== TEAMS INTEGRATION ====================
  
  public async sendTeamsMessage(recipientEmail: string, message: string): Promise<void> {
    // This will use Microsoft Graph API to send Teams messages
    // You'll need to set up Graph permissions in the package-solution.json
    
    try {
      const graphClient = await this.context.msGraphClientFactory.getClient();
      
      await graphClient
        .api('/me/chats')
        .post({
          chatType: 'oneOnOne',
          members: [
            {
              '@odata.type': '#microsoft.graph.aadUserConversationMember',
              roles: ['owner'],
              'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${recipientEmail}')`
            }
          ]
        })
        .then(async (chat: any) => {
          await graphClient
            .api(`/chats/${chat.id}/messages`)
            .post({
              body: {
                content: message
              }
            });
        });
    } catch (error) {
      console.error('Error sending Teams message:', error);
      throw error;
    }
  }
}
