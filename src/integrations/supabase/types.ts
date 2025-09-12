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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string | null
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          purpose: string | null
          reminder_sent: boolean | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          purpose?: string | null
          reminder_sent?: boolean | null
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          purpose?: string | null
          reminder_sent?: boolean | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      drug_interactions: {
        Row: {
          created_at: string
          description: string
          drug_a: string
          drug_b: string
          id: string
          interaction_type: string | null
        }
        Insert: {
          created_at?: string
          description: string
          drug_a: string
          drug_b: string
          id?: string
          interaction_type?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          drug_a?: string
          drug_b?: string
          id?: string
          interaction_type?: string | null
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          drug_name: string
          duration: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          notes: string | null
          patient_id: string
          prescribed_by: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage: string
          drug_name: string
          duration: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          notes?: string | null
          patient_id: string
          prescribed_by?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string
          drug_name?: string
          duration?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          notes?: string | null
          patient_id?: string
          prescribed_by?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_allergies: {
        Row: {
          allergen: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          reaction: string | null
          severity: string | null
          updated_at: string
        }
        Insert: {
          allergen: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          reaction?: string | null
          severity?: string | null
          updated_at?: string
        }
        Update: {
          allergen?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reaction?: string | null
          severity?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patient_files: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          patient_id: string
          uploaded_at: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          patient_id: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          patient_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_files_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          age: number
          condition_diagnosis: string | null
          created_at: string
          date_of_registration: string
          gender: string
          id: string
          name: string
          next_appointment_date: string | null
          notes: string | null
          patient_id: string
          phone: string | null
          profile_picture_url: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          age: number
          condition_diagnosis?: string | null
          created_at?: string
          date_of_registration?: string
          gender: string
          id?: string
          name: string
          next_appointment_date?: string | null
          notes?: string | null
          patient_id: string
          phone?: string | null
          profile_picture_url?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          age?: number
          condition_diagnosis?: string | null
          created_at?: string
          date_of_registration?: string
          gender?: string
          id?: string
          name?: string
          next_appointment_date?: string | null
          notes?: string | null
          patient_id?: string
          phone?: string | null
          profile_picture_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          additional_instructions: string | null
          clinic_address: string | null
          clinic_name: string | null
          created_at: string
          doctor_license: string | null
          doctor_name: string
          id: string
          medication_ids: string[]
          patient_id: string
          prescription_date: string
          signature_path: string | null
          updated_at: string
        }
        Insert: {
          additional_instructions?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          created_at?: string
          doctor_license?: string | null
          doctor_name: string
          id?: string
          medication_ids: string[]
          patient_id: string
          prescription_date?: string
          signature_path?: string | null
          updated_at?: string
        }
        Update: {
          additional_instructions?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          created_at?: string
          doctor_license?: string | null
          doctor_name?: string
          id?: string
          medication_ids?: string[]
          patient_id?: string
          prescription_date?: string
          signature_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      visit_notes: {
        Row: {
          created_at: string
          id: string
          notes: string
          patient_id: string
          visit_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes: string
          patient_id: string
          visit_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string
          patient_id?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_patient_id: {
        Args: Record<PropertyKey, never>
        Returns: string
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
    Enums: {},
  },
} as const
