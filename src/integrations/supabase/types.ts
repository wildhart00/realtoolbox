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
      purchases: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string
          id: string
          purchased_at: string
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          toolbox_slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string
          id?: string
          purchased_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          toolbox_slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string
          id?: string
          purchased_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          toolbox_slug?: string
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
          toolbox: string | null
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
          toolbox?: string | null
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
          toolbox?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stack_entries: {
        Row: {
          created_at: string
          group_name: string
          id: string
          kind: Database["public"]["Enums"]["stack_kind"]
          sort_order: number
          tool_id: string
          updated_at: string
          why_note: string | null
        }
        Insert: {
          created_at?: string
          group_name: string
          id?: string
          kind: Database["public"]["Enums"]["stack_kind"]
          sort_order?: number
          tool_id: string
          updated_at?: string
          why_note?: string | null
        }
        Update: {
          created_at?: string
          group_name?: string
          id?: string
          kind?: Database["public"]["Enums"]["stack_kind"]
          sort_order?: number
          tool_id?: string
          updated_at?: string
          why_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stack_entries_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      stacks: {
        Row: {
          created_at: string
          id: string
          intro_md: string | null
          kind: Database["public"]["Enums"]["stack_kind"]
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          intro_md?: string | null
          kind: Database["public"]["Enums"]["stack_kind"]
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          intro_md?: string | null
          kind?: Database["public"]["Enums"]["stack_kind"]
          subtitle?: string | null
          title?: string
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
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      update_candidates: {
        Row: {
          canonical_url: string
          content_hash: string
          contradictions: string[]
          draft_summary: string
          evidence_level: string
          first_seen_at: string
          flags: string[]
          id: string
          published_at: string | null
          published_date: string
          reviewed_at: string | null
          revision_of: string | null
          risk: string
          risk_reasons: string[]
          source_checked_at: string
          source_id: string
          state: string
          title: string
          updated_at: string
          withdrawn_at: string | null
        }
        Insert: {
          canonical_url: string
          content_hash: string
          contradictions?: string[]
          draft_summary: string
          evidence_level?: string
          first_seen_at?: string
          flags?: string[]
          id: string
          published_at?: string | null
          published_date: string
          reviewed_at?: string | null
          revision_of?: string | null
          risk: string
          risk_reasons?: string[]
          source_checked_at: string
          source_id: string
          state?: string
          title: string
          updated_at?: string
          withdrawn_at?: string | null
        }
        Update: {
          canonical_url?: string
          content_hash?: string
          contradictions?: string[]
          draft_summary?: string
          evidence_level?: string
          first_seen_at?: string
          flags?: string[]
          id?: string
          published_at?: string | null
          published_date?: string
          reviewed_at?: string | null
          revision_of?: string | null
          risk?: string
          risk_reasons?: string[]
          source_checked_at?: string
          source_id?: string
          state?: string
          title?: string
          updated_at?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "update_candidates_revision_of_fkey"
            columns: ["revision_of"]
            isOneToOne: false
            referencedRelation: "update_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_candidates_revision_of_fkey"
            columns: ["revision_of"]
            isOneToOne: false
            referencedRelation: "updates_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_candidates_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "update_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_candidates_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "update_sources_public"
            referencedColumns: ["id"]
          },
        ]
      }
      update_engine_settings: {
        Row: {
          id: boolean
          paused: boolean
          template_auto_publish_tested: boolean
          updated_at: string
        }
        Insert: {
          id?: boolean
          paused?: boolean
          template_auto_publish_tested?: boolean
          updated_at?: string
        }
        Update: {
          id?: boolean
          paused?: boolean
          template_auto_publish_tested?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      update_job_runs: {
        Row: {
          budget_used: Json
          detail: Json
          id: string
          outcome: string
          source_id: string | null
          started_at: string
        }
        Insert: {
          budget_used?: Json
          detail?: Json
          id?: string
          outcome: string
          source_id?: string | null
          started_at?: string
        }
        Update: {
          budget_used?: Json
          detail?: Json
          id?: string
          outcome?: string
          source_id?: string | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_job_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "update_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_job_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "update_sources_public"
            referencedColumns: ["id"]
          },
        ]
      }
      update_review_events: {
        Row: {
          actor_id: string | null
          candidate_id: string
          created_at: string
          from_state: string | null
          id: string
          note: string | null
          to_state: string
        }
        Insert: {
          actor_id?: string | null
          candidate_id: string
          created_at?: string
          from_state?: string | null
          id?: string
          note?: string | null
          to_state: string
        }
        Update: {
          actor_id?: string | null
          candidate_id?: string
          created_at?: string
          from_state?: string | null
          id?: string
          note?: string | null
          to_state?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_review_events_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "update_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_review_events_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "updates_public"
            referencedColumns: ["id"]
          },
        ]
      }
      update_sources: {
        Row: {
          allowed_hosts: string[]
          allowed_path_prefixes: string[]
          cadence_hours: number
          consecutive_failures: number
          created_at: string
          enabled: boolean
          id: string
          index_url: string
          last_attempt_at: string | null
          last_change_at: string | null
          last_error: string | null
          last_good_snapshot_hash: string | null
          last_success_at: string | null
          stale_after_hours: number
          tool_id: string | null
          updated_at: string
          vendor: string
        }
        Insert: {
          allowed_hosts: string[]
          allowed_path_prefixes: string[]
          cadence_hours?: number
          consecutive_failures?: number
          created_at?: string
          enabled?: boolean
          id: string
          index_url: string
          last_attempt_at?: string | null
          last_change_at?: string | null
          last_error?: string | null
          last_good_snapshot_hash?: string | null
          last_success_at?: string | null
          stale_after_hours?: number
          tool_id?: string | null
          updated_at?: string
          vendor: string
        }
        Update: {
          allowed_hosts?: string[]
          allowed_path_prefixes?: string[]
          cadence_hours?: number
          consecutive_failures?: number
          created_at?: string
          enabled?: boolean
          id?: string
          index_url?: string
          last_attempt_at?: string | null
          last_change_at?: string | null
          last_error?: string | null
          last_good_snapshot_hash?: string | null
          last_success_at?: string | null
          stale_after_hours?: number
          tool_id?: string | null
          updated_at?: string
          vendor?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_sources_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          audience: string
          last_seen_updates_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: string
          last_seen_updates_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: string
          last_seen_updates_at?: string | null
          updated_at?: string
          user_id?: string
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
      user_watch_topics: {
        Row: {
          created_at: string
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string
          topic: string
          user_id: string
        }
        Update: {
          created_at?: string
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      update_sources_public: {
        Row: {
          id: string | null
          index_url: string | null
          last_success_at: string | null
          vendor: string | null
        }
        Insert: {
          id?: string | null
          index_url?: string | null
          last_success_at?: string | null
          vendor?: string | null
        }
        Update: {
          id?: string | null
          index_url?: string | null
          last_success_at?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      updates_public: {
        Row: {
          evidence_level: string | null
          id: string | null
          published_at: string | null
          source_checked_at: string | null
          source_published_date: string | null
          source_url: string | null
          summary: string | null
          title: string | null
          vendor: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      engine_record_revision: {
        Args: {
          _canonical_url: string
          _content_hash: string
          _contradictions: string[]
          _draft_summary: string
          _flags: string[]
          _published_date: string
          _revision_of: string
          _risk: string
          _risk_reasons: string[]
          _source_checked_at: string
          _source_id: string
          _title: string
        }
        Returns: string
      }
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
      publish_update_candidate: {
        Args: { _id: string; _note: string }
        Returns: string
      }
      review_update_candidate: {
        Args: { _id: string; _note: string; _to: string }
        Returns: string
      }
      set_update_engine_paused: { Args: { _paused: boolean }; Returns: boolean }
      withdraw_update_candidate: {
        Args: { _id: string; _note: string }
        Returns: string
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
      stack_kind: "investor" | "agent"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      stack_kind: ["investor", "agent"],
      submission_status: ["pending", "approved", "rejected"],
    },
  },
} as const
