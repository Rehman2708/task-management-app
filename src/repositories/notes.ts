import { ApiService } from "../data/network/apiservices";
import { HttpMethods } from "../data/network/httpMethods";
import { AppUrl } from "../utils/appUrl";

// 🔹 Notes payloads
export interface Note {
  _id?: string;
  note: string;
  title: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateNotePayload {
  note: string;
  title: string;
  createdBy: string;
}

export interface UpdateNotePayload {
  note: string;
  title: string;
}

export class NotesRepo {
  // 🔹 Get all notes (optional filter by userId)
  static async getAllNotes(params?: { userId?: string }) {
    return ApiService.getApiResponse(
      AppUrl.getAllNotes,
      HttpMethods.GET,
      params
    );
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
}
