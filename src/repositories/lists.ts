import { ApiService } from "../data/network/apiservices";
import { HttpMethods } from "../data/network/httpMethods";
import { AppUrl } from "../utils/appUrl";

// 🔹 List payloads
export interface ListItem {
  text: string;
  completed: boolean;
  _id?: string;
}

export interface List {
  _id: string;
  title: string;
  description: string;
  image?: string;
  createdBy: string;
  createdByDetails?: {
    name: string;
    image?: string;
  };
  items: ListItem[];
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListPayload {
  title: string;
  description: string;
  image?: string;
  createdBy: string;
  items?: ListItem[];
}

export interface UpdateListPayload {
  title?: string;
  description: string;
  image?: string;
  items?: ListItem[];
  userId: string;
}

export class ListsRepo {
  // 🔹 Get all lists (optionally paginated)
  static async getAllLists(params: {
    ownerUserId: string;
    page?: number;
    pageSize?: number;
  }) {
    const { ownerUserId, page, pageSize } = params;
    const queryParts: string[] = [];
    if (page !== undefined) queryParts.push(`page=${page}`);
    if (pageSize !== undefined) queryParts.push(`pageSize=${pageSize}`);
    const query = queryParts.length ? `?${queryParts.join("&")}` : "";

    const url = `${AppUrl.getAllLists}/${ownerUserId}${query}`;
    return ApiService.getApiResponse(url, HttpMethods.GET);
  }

  // 🔹 Get a single list by ID
  static async getSingleList(listId: string) {
    const url = AppUrl.getSingleList(listId);
    return ApiService.getApiResponse(url, HttpMethods.GET);
  }

  // 🔹 Create a new list
  static async createList(payload: CreateListPayload) {
    return ApiService.getApiResponse(
      AppUrl.createList,
      HttpMethods.POST,
      payload
    );
  }

  // 🔹 Update a list (title or items)
  static async updateList(listId: string, payload: UpdateListPayload) {
    return ApiService.getApiResponse(
      AppUrl.updateList(listId),
      HttpMethods.PUT,
      payload
    );
  }

  // 🔹 Delete a list
  static async deleteList(listId: string, userId: string) {
    return ApiService.getApiResponse(
      AppUrl.deleteList(listId),
      HttpMethods.DELETE,
      { userId }
    );
  }

  // 🔹 Pin or Unpin a list
  static async pinList(listId: string, pinned: boolean, userId: string) {
    return ApiService.getApiResponse(
      AppUrl.pinUnpinList(listId),
      HttpMethods.PATCH,
      { pinned, userId }
    );
  }

  // 🔹 Mark an item as completed or not
  static async toggleListItemStatus(
    listId: string,
    itemIndex: number,
    completed: boolean,
    userId: string
  ) {
    return ApiService.getApiResponse(
      AppUrl.toggleListItem(listId, itemIndex),
      HttpMethods.PATCH,
      { completed, userId }
    );
  }
}
