export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      answers: {
        Row: {
          answer: string
          answer_time: number
          created_at: string | null
          id: string
          is_correct: boolean
          player_id: string | null
          question_id: string | null
        }
        Insert: {
          answer: string
          answer_time: number
          created_at?: string | null
          id?: string
          is_correct: boolean
          player_id?: string | null
          question_id?: string | null
        }
        Update: {
          answer?: string
          answer_time?: number
          created_at?: string | null
          id?: string
          is_correct?: boolean
          player_id?: string | null
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          lobby_id: string | null
          player_id: string | null
          reaction: string | null
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          lobby_id?: string | null
          player_id?: string | null
          reaction?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          lobby_id?: string | null
          player_id?: string | null
          reaction?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_movies: {
        Row: {
          created_at: string | null
          id: string
          movie_title: string
          player_id: string | null
          tmdb_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          movie_title: string
          player_id?: string | null
          tmdb_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          movie_title?: string
          player_id?: string | null
          tmdb_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "favorite_movies_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      final_burns: {
        Row: {
          content: string
          created_at: string | null
          id: string
          lobby_id: string | null
          player_id: string | null
          shame_list: string[]
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          lobby_id?: string | null
          player_id?: string | null
          shame_list: string[]
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          lobby_id?: string | null
          player_id?: string | null
          shame_list?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "final_burns_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_burns_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      lobbies: {
        Row: {
          code: string
          config: Json | null
          created_at: string | null
          current_question_id: string | null
          ended_at: string | null
          game_stage: string | null
          host_id: string
          id: string
          started_at: string | null
        }
        Insert: {
          code: string
          config?: Json | null
          created_at?: string | null
          current_question_id?: string | null
          ended_at?: string | null
          game_stage?: string | null
          host_id: string
          id?: string
          started_at?: string | null
        }
        Update: {
          code?: string
          config?: Json | null
          created_at?: string | null
          current_question_id?: string | null
          ended_at?: string | null
          game_stage?: string | null
          host_id?: string
          id?: string
          started_at?: string | null
        }
        Relationships: []
      }
      movies: {
        Row: {
          backdrop_path: string | null
          created_at: string | null
          data: Json | null
          genres: string[] | null
          id: string
          overview: string | null
          poster_path: string | null
          release_date: string | null
          title: string
          tmdb_id: number | null
        }
        Insert: {
          backdrop_path?: string | null
          created_at?: string | null
          data?: Json | null
          genres?: string[] | null
          id?: string
          overview?: string | null
          poster_path?: string | null
          release_date?: string | null
          title: string
          tmdb_id?: number | null
        }
        Update: {
          backdrop_path?: string | null
          created_at?: string | null
          data?: Json | null
          genres?: string[] | null
          id?: string
          overview?: string | null
          poster_path?: string | null
          release_date?: string | null
          title?: string
          tmdb_id?: number | null
        }
        Relationships: []
      }
      players: {
        Row: {
          avatar_url: string | null
          correct_answers: number | null
          created_at: string | null
          has_been_roasted: boolean | null
          id: string
          incorrect_answers: number | null
          is_host: boolean | null
          is_ready: boolean | null
          lobby_id: string | null
          name: string
          score: number | null
          streak: number | null
        }
        Insert: {
          avatar_url?: string | null
          correct_answers?: number | null
          created_at?: string | null
          has_been_roasted?: boolean | null
          id?: string
          incorrect_answers?: number | null
          is_host?: boolean | null
          is_ready?: boolean | null
          lobby_id?: string | null
          name: string
          score?: number | null
          streak?: number | null
        }
        Update: {
          avatar_url?: string | null
          correct_answers?: number | null
          created_at?: string | null
          has_been_roasted?: boolean | null
          id?: string
          incorrect_answers?: number | null
          is_host?: boolean | null
          is_ready?: boolean | null
          lobby_id?: string | null
          name?: string
          score?: number | null
          streak?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          difficulty: string | null
          explanation: string | null
          id: string
          image_url: string | null
          lobby_id: string | null
          movie_id: string | null
          options: string[]
          points: number | null
          question: string
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          lobby_id?: string | null
          movie_id?: string | null
          options: string[]
          points?: number | null
          question: string
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          lobby_id?: string | null
          movie_id?: string | null
          options?: string[]
          points?: number | null
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      roasts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          player_id: string | null
          question_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          player_id?: string | null
          question_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          player_id?: string | null
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roasts_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roasts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      shame_movies: {
        Row: {
          created_at: string | null
          id: string
          movie_title: string
          player_id: string | null
          reason: string
          tmdb_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          movie_title: string
          player_id?: string | null
          reason: string
          tmdb_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          movie_title?: string
          player_id?: string | null
          reason?: string
          tmdb_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shame_movies_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_player_score: {
        Args: {
          p_player_id: string
          p_score: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

