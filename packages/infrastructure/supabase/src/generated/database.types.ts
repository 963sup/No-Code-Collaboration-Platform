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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      activity_events: {
        Row: {
          actor_id: string
          created_at: string
          event_type: string
          id: number
          payload: Json
          repository_id: string
          subject_id: string | null
          subject_type: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          event_type: string
          id?: never
          payload?: Json
          repository_id: string
          subject_id?: string | null
          subject_type: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          event_type?: string
          id?: never
          payload?: Json
          repository_id?: string
          subject_id?: string | null
          subject_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_comments: {
        Row: {
          body: string
          created_at: string
          created_by: string
          discussion_id: string
          id: string
          repository_id: string
          updated_at: string
          version: number
        }
        Insert: {
          body: string
          created_at?: string
          created_by: string
          discussion_id: string
          id?: string
          repository_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          discussion_id?: string
          id?: string
          repository_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "discussion_comments_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_comments_discussion_repository_fk"
            columns: ["repository_id", "discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["repository_id", "id"]
          },
          {
            foreignKeyName: "discussion_comments_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          answer_comment_id: string | null
          body: string
          category: Database["public"]["Enums"]["discussion_category"]
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          discussion_number: number
          id: string
          is_locked: boolean
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["discussion_status"]
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          answer_comment_id?: string | null
          body?: string
          category: Database["public"]["Enums"]["discussion_category"]
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by: string
          discussion_number: number
          id?: string
          is_locked?: boolean
          repository_id: string
          search_vector?: unknown
          status?: Database["public"]["Enums"]["discussion_status"]
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          answer_comment_id?: string | null
          body?: string
          category?: Database["public"]["Enums"]["discussion_category"]
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by?: string
          discussion_number?: number
          id?: string
          is_locked?: boolean
          repository_id?: string
          search_vector?: unknown
          status?: Database["public"]["Enums"]["discussion_status"]
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "discussions_answer_comment_fk"
            columns: ["id", "answer_comment_id"]
            isOneToOne: false
            referencedRelation: "discussion_comments"
            referencedColumns: ["discussion_id", "id"]
          },
          {
            foreignKeyName: "discussions_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_assignees: {
        Row: {
          assigned_at: string
          assigned_by: string
          issue_id: string
          repository_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          issue_id: string
          repository_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          issue_id?: string
          repository_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_assignees_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_assignees_issue_repository_fk"
            columns: ["repository_id", "issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["repository_id", "id"]
          },
          {
            foreignKeyName: "issue_assignees_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_comments: {
        Row: {
          body: string
          created_at: string
          created_by: string
          id: string
          issue_id: string
          repository_id: string
          updated_at: string
          version: number
        }
        Insert: {
          body: string
          created_at?: string
          created_by: string
          id?: string
          issue_id: string
          repository_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          issue_id?: string
          repository_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "issue_comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_comments_issue_repository_fk"
            columns: ["repository_id", "issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["repository_id", "id"]
          },
          {
            foreignKeyName: "issue_comments_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_labels: {
        Row: {
          applied_at: string
          applied_by: string
          issue_id: string
          label_id: string
          repository_id: string
        }
        Insert: {
          applied_at?: string
          applied_by: string
          issue_id: string
          label_id: string
          repository_id: string
        }
        Update: {
          applied_at?: string
          applied_by?: string
          issue_id?: string
          label_id?: string
          repository_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_labels_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_labels_issue_repository_fk"
            columns: ["repository_id", "issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["repository_id", "id"]
          },
          {
            foreignKeyName: "issue_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "repository_labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_labels_label_repository_fk"
            columns: ["repository_id", "label_id"]
            isOneToOne: false
            referencedRelation: "repository_labels"
            referencedColumns: ["repository_id", "id"]
          },
          {
            foreignKeyName: "issue_labels_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          body: string
          close_reason: Database["public"]["Enums"]["issue_close_reason"] | null
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          id: string
          issue_number: number
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          body?: string
          close_reason?:
            | Database["public"]["Enums"]["issue_close_reason"]
            | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by: string
          id?: string
          issue_number: number
          repository_id: string
          search_vector?: unknown
          status?: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          body?: string
          close_reason?:
            | Database["public"]["Enums"]["issue_close_reason"]
            | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by?: string
          id?: string
          issue_number?: number
          repository_id?: string
          search_vector?: unknown
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "issues_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          is_muted: boolean
          is_watched: boolean
          recipient_id: string
          repository_id: string
          subject_id: string
          subject_type: Database["public"]["Enums"]["notification_artifact_type"]
          updated_at: string
        }
        Insert: {
          is_muted?: boolean
          is_watched?: boolean
          recipient_id: string
          repository_id: string
          subject_id: string
          subject_type: Database["public"]["Enums"]["notification_artifact_type"]
          updated_at?: string
        }
        Update: {
          is_muted?: boolean
          is_watched?: boolean
          recipient_id?: string
          repository_id?: string
          subject_id?: string
          subject_type?: Database["public"]["Enums"]["notification_artifact_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_threads: {
        Row: {
          artifact_id: string
          artifact_type: Database["public"]["Enums"]["notification_artifact_type"]
          created_at: string
          event_count: number
          id: string
          reason: Database["public"]["Enums"]["notification_reason"]
          recipient_id: string
          repository_id: string
          source_evidence_id: number
          state: Database["public"]["Enums"]["notification_state"]
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id: string
          artifact_type: Database["public"]["Enums"]["notification_artifact_type"]
          created_at?: string
          event_count?: number
          id?: string
          reason: Database["public"]["Enums"]["notification_reason"]
          recipient_id: string
          repository_id: string
          source_evidence_id: number
          state?: Database["public"]["Enums"]["notification_state"]
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string
          artifact_type?: Database["public"]["Enums"]["notification_artifact_type"]
          created_at?: string
          event_count?: number
          id?: string
          reason?: Database["public"]["Enums"]["notification_reason"]
          recipient_id?: string
          repository_id?: string
          source_evidence_id?: number
          state?: Database["public"]["Enums"]["notification_state"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_threads_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_threads_source_evidence_id_fkey"
            columns: ["source_evidence_id"]
            isOneToOne: false
            referencedRelation: "activity_events"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      repositories: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          owner_organization_id: string | null
          owner_user_id: string | null
          search_vector: unknown
          slug: string
          updated_at: string
          visibility: Database["public"]["Enums"]["repository_visibility"]
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          owner_organization_id?: string | null
          owner_user_id?: string | null
          search_vector?: unknown
          slug: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["repository_visibility"]
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          owner_organization_id?: string | null
          owner_user_id?: string | null
          search_vector?: unknown
          slug?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["repository_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "repositories_owner_organization_id_fkey"
            columns: ["owner_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      repository_artifact_counters: {
        Row: {
          artifact_type: string
          last_number: number
          repository_id: string
        }
        Insert: {
          artifact_type: string
          last_number?: number
          repository_id: string
        }
        Update: {
          artifact_type?: string
          last_number?: number
          repository_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repository_artifact_counters_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      repository_labels: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          repository_id: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
          repository_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          repository_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repository_labels_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      repository_user_grants: {
        Row: {
          created_at: string
          granted_by: string
          repository_id: string
          role: Database["public"]["Enums"]["repository_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by: string
          repository_id: string
          role: Database["public"]["Enums"]["repository_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string
          repository_id?: string
          role?: Database["public"]["Enums"]["repository_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repository_user_grants_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          content: Json
          created_at: string
          created_by: string
          id: string
          kind: Database["public"]["Enums"]["resource_kind"]
          repository_id: string
          search_vector: unknown
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by: string
          id?: string
          kind: Database["public"]["Enums"]["resource_kind"]
          repository_id: string
          search_vector?: unknown
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string
          id?: string
          kind?: Database["public"]["Enums"]["resource_kind"]
          repository_id?: string
          search_vector?: unknown
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_discussion_comment: {
        Args: {
          comment_body: string
          discussion_id: string
          expected_version: number
          mentioned_user_ids?: string[]
          target_repository_id: string
        }
        Returns: {
          answer_comment_id: string | null
          body: string
          category: Database["public"]["Enums"]["discussion_category"]
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          discussion_number: number
          id: string
          is_locked: boolean
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["discussion_status"]
          title: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "discussions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      add_issue_comment: {
        Args: {
          comment_body: string
          expected_version: number
          issue_id: string
          mentioned_user_ids?: string[]
          target_repository_id: string
        }
        Returns: {
          body: string
          close_reason: Database["public"]["Enums"]["issue_close_reason"] | null
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          id: string
          issue_number: number
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "issues"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      clear_discussion_answer: {
        Args: {
          discussion_id: string
          expected_version: number
          target_repository_id: string
        }
        Returns: {
          answer_comment_id: string | null
          body: string
          category: Database["public"]["Enums"]["discussion_category"]
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          discussion_number: number
          id: string
          is_locked: boolean
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["discussion_status"]
          title: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "discussions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_discussion: {
        Args: {
          discussion_body?: string
          discussion_category: Database["public"]["Enums"]["discussion_category"]
          discussion_title: string
          mentioned_user_ids?: string[]
          target_repository_id: string
        }
        Returns: {
          answer_comment_id: string | null
          body: string
          category: Database["public"]["Enums"]["discussion_category"]
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          discussion_number: number
          id: string
          is_locked: boolean
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["discussion_status"]
          title: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "discussions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_issue: {
        Args: {
          issue_body?: string
          issue_title: string
          mentioned_user_ids?: string[]
          target_repository_id: string
        }
        Returns: {
          body: string
          close_reason: Database["public"]["Enums"]["issue_close_reason"] | null
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          id: string
          issue_number: number
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "issues"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_page: {
        Args: { page_title: string; target_repository_id: string }
        Returns: {
          content: Json
          created_at: string
          created_by: string
          id: string
          kind: Database["public"]["Enums"]["resource_kind"]
          repository_id: string
          title: string
          updated_at: string
        }[]
      }
      edit_discussion: {
        Args: {
          discussion_body: string
          discussion_id: string
          discussion_title: string
          expected_version: number
          mentioned_user_ids?: string[]
          target_repository_id: string
        }
        Returns: {
          answer_comment_id: string | null
          body: string
          category: Database["public"]["Enums"]["discussion_category"]
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          discussion_number: number
          id: string
          is_locked: boolean
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["discussion_status"]
          title: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "discussions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      edit_issue: {
        Args: {
          expected_version: number
          issue_body: string
          issue_id: string
          issue_title: string
          mentioned_user_ids?: string[]
          target_repository_id: string
        }
        Returns: {
          body: string
          close_reason: Database["public"]["Enums"]["issue_close_reason"] | null
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          id: string
          issue_number: number
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "issues"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      execute_repository_grant_command: {
        Args: {
          expected_role: Database["public"]["Enums"]["repository_role"]
          proposed_role: Database["public"]["Enums"]["repository_role"]
          target_repository_id: string
          target_user_id: string
        }
        Returns: string
      }
      explore_public_repositories: {
        Args: {
          requested_artifact_type?: string
          requested_owner_type?: string
          requested_page?: number
          requested_sort?: string
        }
        Returns: {
          created_at: string
          description: string
          href: string
          id: string
          last_public_activity_at: string
          name: string
          owner_slug: string
          owner_type: string
          slug: string
          total_count: number
        }[]
      }
      find_repository_grant_target_by_username: {
        Args: { target_repository_id: string; target_username: string }
        Returns: {
          avatar_url: string
          display_name: string
          user_id: string
          username: string
        }[]
      }
      get_accessible_repository_route_by_id: {
        Args: { target_repository_id: string }
        Returns: {
          description: string
          id: string
          name: string
          owner_id: string
          owner_kind: string
          owner_slug: string
          slug: string
          visibility: Database["public"]["Enums"]["repository_visibility"]
        }[]
      }
      get_accessible_repository_route_by_key: {
        Args: { target_owner_slug: string; target_repository_slug: string }
        Returns: {
          description: string
          id: string
          name: string
          owner_id: string
          owner_kind: string
          owner_slug: string
          slug: string
          visibility: Database["public"]["Enums"]["repository_visibility"]
        }[]
      }
      get_current_repository_access_sources: {
        Args: { target_repository_id: string }
        Returns: {
          direct_role: Database["public"]["Enums"]["repository_role"]
          governance_role: Database["public"]["Enums"]["repository_role"]
        }[]
      }
      get_owner_profile_by_slug: {
        Args: { target_owner_slug: string }
        Returns: {
          avatar_url: string
          display_name: string
          owner_id: string
          owner_kind: string
          owner_slug: string
        }[]
      }
      list_accessible_repository_routes: {
        Args: never
        Returns: {
          description: string
          id: string
          name: string
          owner_id: string
          owner_kind: string
          owner_slug: string
          slug: string
          visibility: Database["public"]["Enums"]["repository_visibility"]
        }[]
      }
      list_notifications: {
        Args: { requested_page?: number; requested_state?: string }
        Returns: {
          artifact_id: string
          artifact_type: Database["public"]["Enums"]["notification_artifact_type"]
          event_count: number
          href: string
          id: string
          reason: Database["public"]["Enums"]["notification_reason"]
          repository_id: string
          source_evidence_id: number
          state: Database["public"]["Enums"]["notification_state"]
          title: string
          total_count: number
          updated_at: string
        }[]
      }
      list_owner_repository_routes: {
        Args: { target_owner_slug: string }
        Returns: {
          description: string
          id: string
          name: string
          owner_id: string
          owner_kind: string
          owner_slug: string
          slug: string
          visibility: Database["public"]["Enums"]["repository_visibility"]
        }[]
      }
      list_project_items: {
        Args: {
          requested_assignee_id?: string
          requested_label_id?: string
          requested_page?: number
          requested_sort?: string
          requested_status?: string
          requested_type?: string
          target_repository_id?: string
        }
        Returns: {
          created_at: string
          href: string
          id: string
          item_type: string
          repository_id: string
          status: string
          title: string
          total_count: number
          updated_at: string
        }[]
      }
      list_repository_direct_grants: {
        Args: { target_repository_id: string }
        Returns: {
          avatar_url: string
          display_name: string
          role: Database["public"]["Enums"]["repository_role"]
          user_id: string
          username: string
        }[]
      }
      mark_all_notifications_read: { Args: never; Returns: number }
      search_collaboration: {
        Args: {
          requested_owner?: string
          requested_page?: number
          requested_repository?: string
          requested_sort?: string
          requested_status?: string
          requested_type?: string
          search_query: string
        }
        Returns: {
          body_snippet: string
          created_at: string
          href: string
          repository_id: string
          result_type: string
          stable_id: string
          title: string
          total_count: number
          updated_at: string
        }[]
      }
      set_discussion_answer: {
        Args: {
          expected_version: number
          target_answer_comment_id: string
          target_discussion_id: string
          target_repository_id: string
        }
        Returns: {
          answer_comment_id: string | null
          body: string
          category: Database["public"]["Enums"]["discussion_category"]
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          discussion_number: number
          id: string
          is_locked: boolean
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["discussion_status"]
          title: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "discussions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      set_discussion_lock: {
        Args: {
          discussion_id: string
          expected_version: number
          should_lock: boolean
          target_repository_id: string
        }
        Returns: {
          answer_comment_id: string | null
          body: string
          category: Database["public"]["Enums"]["discussion_category"]
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          discussion_number: number
          id: string
          is_locked: boolean
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["discussion_status"]
          title: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "discussions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      set_issue_assignee: {
        Args: {
          assignee_id: string
          expected_version: number
          should_assign: boolean
          target_issue_id: string
          target_repository_id: string
        }
        Returns: {
          body: string
          close_reason: Database["public"]["Enums"]["issue_close_reason"] | null
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          id: string
          issue_number: number
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "issues"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      set_issue_label: {
        Args: {
          expected_version: number
          issue_id: string
          label_id: string
          should_apply: boolean
          target_repository_id: string
        }
        Returns: {
          body: string
          close_reason: Database["public"]["Enums"]["issue_close_reason"] | null
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          id: string
          issue_number: number
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "issues"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      set_notification_preference: {
        Args: {
          target_mode: string
          target_repository_id: string
          target_subject_id: string
          target_subject_type: Database["public"]["Enums"]["notification_artifact_type"]
        }
        Returns: boolean
      }
      transition_discussion: {
        Args: {
          discussion_id: string
          expected_version: number
          target_repository_id: string
          target_status: Database["public"]["Enums"]["discussion_status"]
        }
        Returns: {
          answer_comment_id: string | null
          body: string
          category: Database["public"]["Enums"]["discussion_category"]
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          discussion_number: number
          id: string
          is_locked: boolean
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["discussion_status"]
          title: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "discussions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      transition_issue: {
        Args: {
          expected_version: number
          issue_id: string
          target_close_reason?: Database["public"]["Enums"]["issue_close_reason"]
          target_repository_id: string
          target_status: Database["public"]["Enums"]["issue_status"]
        }
        Returns: {
          body: string
          close_reason: Database["public"]["Enums"]["issue_close_reason"] | null
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          id: string
          issue_number: number
          repository_id: string
          search_vector: unknown
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
          version: number
        }[]
        SetofOptions: {
          from: "*"
          to: "issues"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_notification_state: {
        Args: {
          notification_id: string
          target_state: Database["public"]["Enums"]["notification_state"]
        }
        Returns: boolean
      }
      update_page: {
        Args: {
          expected_updated_at: string
          page_body: string
          page_id: string
          page_title: string
          target_repository_id: string
        }
        Returns: {
          content: Json
          created_at: string
          created_by: string
          id: string
          kind: Database["public"]["Enums"]["resource_kind"]
          repository_id: string
          title: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      discussion_category: "general" | "question" | "announcement"
      discussion_status: "open" | "closed"
      issue_close_reason: "completed" | "cancelled"
      issue_status: "open" | "closed"
      notification_artifact_type: "repository" | "page" | "issue" | "discussion"
      notification_reason:
        | "watching"
        | "assigned"
        | "mentioned"
        | "participating"
      notification_state: "unread" | "read" | "archived"
      organization_role: "member" | "admin" | "owner"
      repository_role: "viewer" | "contributor" | "manager" | "admin"
      repository_visibility: "private" | "public"
      resource_kind: "page"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      discussion_category: ["general", "question", "announcement"],
      discussion_status: ["open", "closed"],
      issue_close_reason: ["completed", "cancelled"],
      issue_status: ["open", "closed"],
      notification_artifact_type: ["repository", "page", "issue", "discussion"],
      notification_reason: [
        "watching",
        "assigned",
        "mentioned",
        "participating",
      ],
      notification_state: ["unread", "read", "archived"],
      organization_role: ["member", "admin", "owner"],
      repository_role: ["viewer", "contributor", "manager", "admin"],
      repository_visibility: ["private", "public"],
      resource_kind: ["page"],
    },
  },
} as const

