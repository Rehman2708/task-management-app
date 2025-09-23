import { ApiService } from "../data/network/apiservices";
import { HttpMethods } from "../data/network/httpMethods";
import { AppUrl } from "../utils/appUrl";

// 🔹 Notes payloads
export interface Note {
  _id: string;
  image?: string;
  note: string;
  title: string;
  createdBy: string;
  createdByDetails?: {
    name: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
}

export interface CreateNotePayload {
  note: string;
  title: string;
  createdBy: string;
  image?: string | null;
}

export interface UpdateNotePayload {
  note: string;
  title: string;
  image?: string | null;
}

export class NotesRepo {
  // 🔹 Get all notes (with optional pagination)
  static async getAllNotes(params: {
    ownerUserId: string;
    page?: number;
    pageSize?: number;
  }) {
    const { ownerUserId, page, pageSize } = params;

    // Build query string if pagination values exist
    const queryParts: string[] = [];
    if (page !== undefined) queryParts.push(`page=${page}`);
    if (pageSize !== undefined) queryParts.push(`pageSize=${pageSize}`);
    const query = queryParts.length ? `?${queryParts.join("&")}` : "";

    const url = `${AppUrl.getAllNotes}/${ownerUserId}${query}`;
    return ApiService.getApiResponse(url, HttpMethods.GET);
  }

  // 🔹 Create a new note
  static async createNote(payload: CreateNotePayload) {
    return ApiService.getApiResponse(
      AppUrl.createNote,
      HttpMethods.POST,
      payload
    );
  }

  // 🔹 Update an existing note
  static async updateNote(noteId: string, payload: UpdateNotePayload) {
    return ApiService.getApiResponse(
      AppUrl.updateNote(noteId),
      HttpMethods.PUT,
      payload
    );
  }

  // 🔹 Delete a note
  static async deleteNote(noteId: string) {
    return ApiService.getApiResponse(
      AppUrl.deleteNote(noteId),
      HttpMethods.DELETE
    );
  }
  // 🔹 Pin or Unpin a note
  static async pinNote(noteId: string, pinned: boolean) {
    return ApiService.getApiResponse(
      AppUrl.pinUnpinNote(noteId), // You need to add this in your AppUrl file
      HttpMethods.PATCH,
      { pinned }
    );
  }
}
