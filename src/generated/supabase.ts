export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          content: string
          created_at: string | null
          id: string
          nominee_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          nominee_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          nominee_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_nominee_id_fkey"
            columns: ["nominee_id"]
            isOneToOne: false
            referencedRelation: "nominees"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          description: string | null
          id: string
          lobby_id: string | null
          locked: boolean | null
          name: string
          order: number
        }
        Insert: {
          description?: string | null
          id?: string
          lobby_id?: string | null
          locked?: boolean | null
          name: string
          order: number
        }
        Update: {
          description?: string | null
          id?: string
          lobby_id?: string | null
          locked?: boolean | null
          name?: string
          order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          lobby_id: string | null
          player_id: string | null
          reaction: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          lobby_id?: string | null
          player_id?: string | null
          reaction?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
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
      lobbies: {
        Row: {
          code: string
          created_at: string | null
          ended_at: string | null
          host_id: string
          id: string
          started_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          ended_at?: string | null
          host_id: string
          id?: string
          started_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          ended_at?: string | null
          host_id?: string
          id?: string
          started_at?: string | null
        }
        Relationships: []
      }
      nominees: {
        Row: {
          category_id: string | null
          country: string | null
          director: string | null
          id: string
          image_url: string | null
          is_winner: boolean | null
          movie: string | null
          name: string
          producers: string[] | null
        }
        Insert: {
          category_id?: string | null
          country?: string | null
          director?: string | null
          id?: string
          image_url?: string | null
          is_winner?: boolean | null
          movie?: string | null
          name: string
          producers?: string[] | null
        }
        Update: {
          category_id?: string | null
          country?: string | null
          director?: string | null
          id?: string
          image_url?: string | null
          is_winner?: boolean | null
          movie?: string | null
          name?: string
          producers?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "nominees_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          is_host: boolean | null
          lobby_id: string | null
          name: string
          score: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_host?: boolean | null
          lobby_id?: string | null
          name: string
          score?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_host?: boolean | null
          lobby_id?: string | null
          name?: string
          score?: number | null
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
      predictions: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          nominee_id: string | null
          player_id: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          nominee_id?: string | null
          player_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          nominee_id?: string | null
          player_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predictions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_nominee_id_fkey"
            columns: ["nominee_id"]
            isOneToOne: false
            referencedRelation: "nominees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      trivia_answers: {
        Row: {
          answer: string
          answer_time: number
          created_at: string | null
          id: string
          is_correct: boolean
          player_id: string | null
          trivia_id: string | null
        }
        Insert: {
          answer: string
          answer_time: number
          created_at?: string | null
          id?: string
          is_correct: boolean
          player_id?: string | null
          trivia_id?: string | null
        }
        Update: {
          answer?: string
          answer_time?: number
          created_at?: string | null
          id?: string
          is_correct?: boolean
          player_id?: string | null
          trivia_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trivia_answers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_answers_trivia_id_fkey"
            columns: ["trivia_id"]
            isOneToOne: false
            referencedRelation: "trivia_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      trivia_questions: {
        Row: {
          category_id: string | null
          correct_answer: string
          explanation: string | null
          id: string
          options: string[]
          question: string
        }
        Insert: {
          category_id?: string | null
          correct_answer: string
          explanation?: string | null
          id?: string
          options: string[]
          question: string
        }
        Update: {
          category_id?: string | null
          correct_answer?: string
          explanation?: string | null
          id?: string
          options?: string[]
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "trivia_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
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

