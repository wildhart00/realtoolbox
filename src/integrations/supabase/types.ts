export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      affiliate_earnings: {
        Row: {
          created_at: string
          id: string
          month: string
          notes: string | null
          payment_date: string | null
          payment_received: number | null
          program_id: string
          reported_earnings: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          notes?: string | null
          payment_date?: string | null
          payment_received?: number | null
          program_id: string
          reported_earnings?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          notes?: string | null
          payment_date?: string | null
          payment_received?: number | null
          program_id?: string
          reported_earnings?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_earnings_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "affiliate_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_programs: {
        Row: {
          affiliate_url: string
          approval_date: string | null
          commission_rate: string
          created_at: string
          id: string
          network: string
          notes: string | null
          program_name: string
          signup_date: string | null
          status: Database["public"]["Enums"]["affiliate_status"]
          tool_id: string | null
          updated_at: string
        }
        Insert: {
          affiliate_url?: string
          approval_date?: string | null
          commission_rate?: string
          created_at?: string
          id?: string
          network?: string
          notes?: string | null
          program_name: string
          signup_date?: string | null
          status?: Database["public"]["Enums"]["affiliate_status"]
          tool_id?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_url?: string
          approval_date?: string | null
          commission_rate?: string
          created_at?: string
          id?: string
          network?: string
          notes?: string | null
          program_name?: string
          signup_date?: string | null
          status?: Database["public"]["Enums"]["affiliate_status"]
          tool_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_programs_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_name: string
          body: string
          cover_image_url: string | null
          created_at: string
          excerpt: string
          id: string
          is_published: boolean
          published_at: string
          reading_minutes: number
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string
          body: string
          cover_image_url?: string | null
          created_at?: string
          excerpt: string
          id?: string
          is_published?: boolean
          published_at?: string
          reading_minutes?: number
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          body?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          is_published?: boolean
          published_at?: string
          reading_minutes?: number
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      click_events: {
        Row: {
          created_at: string
          id: string
          referrer: string | null
          tool_id: string | null
          tool_slug: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referrer?: string | null
          tool_id?: string | null
          tool_slug?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referrer?: string | null
          tool_id?: string | null
          tool_slug?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          category: string
          created_at: string
          difficulty: string
          id: string
          is_published: boolean
          logo_url: string | null
          name: string
          setup_url: string
          slug: string
          sort_order: number
          tagline: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          difficulty?: string
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name: string
          setup_url: string
          slug: string
          sort_order?: number
          tagline: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          difficulty?: string
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name?: string
          setup_url?: string
          slug?: string
          sort_order?: number
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          investor_stage: string | null
          source: string | null
          workflow_name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          investor_stage?: string | null
          source?: string | null
          workflow_name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          investor_stage?: string | null
          source?: string | null
          workflow_name?: string | null
        }
        Relationships: []
      }
      premium_resources: {
        Row: {
          cover_emoji: string | null
          created_at: string
          description: string | null
          file_path: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_emoji?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_emoji?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          access_level: string
          cover_image_url: string | null
          created_at: string
          description: string
          file_url: string | null
          id: string
          is_published: boolean
          slug: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string
          file_url?: string | null
          id?: string
          is_published?: boolean
          slug: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string
          file_url?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          rating: number
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          rating: number
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          rating?: number
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_tools: {
        Row: {
          created_at: string
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          skill_slug: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          skill_slug: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          skill_slug?: string
          source?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          access_level: string
          audience: string
          created_at: string
          description: string | null
          download_count: number
          file_url: string | null
          id: string
          is_published: boolean
          name: string
          overview: string | null
          price: number
          slug: string
          sort_order: number
          tagline: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          access_level: string
          audience: string
          created_at?: string
          description?: string | null
          download_count?: number
          file_url?: string | null
          id?: string
          is_published?: boolean
          name: string
          overview?: string | null
          price?: number
          slug: string
          sort_order?: number
          tagline?: string | null
          tier: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          audience?: string
          created_at?: string
          description?: string | null
          download_count?: number
          file_url?: string | null
          id?: string
          is_published?: boolean
          name?: string
          overview?: string | null
          price?: number
          slug?: string
          sort_order?: number
          tagline?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          logo_url: string | null
          name: string
          status: Database["public"]["Enums"]["submission_status"]
          submitted_by: string | null
          submitter_email: string
          submitter_name: string
          tagline: string
          tool_category: string | null
          updated_at: string
          wants_featured: boolean
          website_url: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          logo_url?: string | null
          name: string
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_by?: string | null
          submitter_email: string
          submitter_name: string
          tagline: string
          tool_category?: string | null
          updated_at?: string
          wants_featured?: boolean
          website_url: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          logo_url?: string | null
          name?: string
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_by?: string | null
          submitter_email?: string
          submitter_name?: string
          tagline?: string
          tool_category?: string | null
          updated_at?: string
          wants_featured?: boolean
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_tools_category_id_fkey"
            columns: ["tool_category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_categories: {
        Row: {
          category_id: string
          tool_id: string
        }
        Insert: {
          category_id: string
          tool_id: string
        }
        Update: {
          category_id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_categories_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          affiliate_url: string | null
          banner_color: string | null
          created_at: string
          description: string
          featured_order: number | null
          founder_avatar_url: string | null
          founder_bio: string | null
          founder_name: string | null
          full_description: string | null
          hero_image_url: string | null
          id: string
          is_editors_pick: boolean
          is_featured: boolean
          is_just_launched: boolean
          is_verified: boolean
          just_launched_date: string | null
          key_features: string[]
          logo_url: string | null
          name: string
          pricing: Database["public"]["Enums"]["pricing_model"]
          pricing_details: string | null
          re_only: boolean | null
          screenshot_url: string | null
          slug: string
          status: string | null
          tagline: string
          tags: string[] | null
          updated_at: string
          use_cases: string[]
          website_url: string
        }
        Insert: {
          affiliate_url?: string | null
          banner_color?: string | null
          created_at?: string
          description: string
          featured_order?: number | null
          founder_avatar_url?: string | null
          founder_bio?: string | null
          founder_name?: string | null
          full_description?: string | null
          hero_image_url?: string | null
          id?: string
          is_editors_pick?: boolean
          is_featured?: boolean
          is_just_launched?: boolean
          is_verified?: boolean
          just_launched_date?: string | null
          key_features?: string[]
          logo_url?: string | null
          name: string
          pricing?: Database["public"]["Enums"]["pricing_model"]
          pricing_details?: string | null
          re_only?: boolean | null
          screenshot_url?: string | null
          slug: string
          status?: string | null
          tagline: string
          tags?: string[] | null
          updated_at?: string
          use_cases?: string[]
          website_url: string
        }
        Update: {
          affiliate_url?: string | null
          banner_color?: string | null
          created_at?: string
          description?: string
          featured_order?: number | null
          founder_avatar_url?: string | null
          founder_bio?: string | null
          founder_name?: string | null
          full_description?: string | null
          hero_image_url?: string | null
          id?: string
          is_editors_pick?: boolean
          is_featured?: boolean
          is_just_launched?: boolean
          is_verified?: boolean
          just_launched_date?: string | null
          key_features?: string[]
          logo_url?: string | null
          name?: string
          pricing?: Database["public"]["Enums"]["pricing_model"]
          pricing_details?: string | null
          re_only?: boolean | null
          screenshot_url?: string | null
          slug?: string
          status?: string | null
          tagline?: string
          tags?: string[] | null
          updated_at?: string
          use_cases?: string[]
          website_url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_skill_download: {
        Args: { skill_slug: string }
        Returns: number
      }
    }
    Enums: {
      affiliate_status:
        | "applied"
        | "pending"
        | "approved"
        | "declined"
        | "paused"
      app_role: "admin" | "member"
      pricing_model: "free" | "freemium" | "paid"
      submission_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      affiliate_status: [
        "applied",
        "pending",
        "approved",
        "declined",
        "paused",
      ],
      app_role: ["admin", "member"],
      pricing_model: ["free", "freemium", "paid"],
      submission_status: ["pending", "approved", "rejected"],
    },
  },
} as const
