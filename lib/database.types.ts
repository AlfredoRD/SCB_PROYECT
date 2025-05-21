export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      nominees: {
        Row: {
          id: number
          name: string
          title: string | null
          description: string | null
          category: string
          image_url: string | null
          avatar_url: string | null
          tags: string[] | null
          votes_count: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          title?: string | null
          description?: string | null
          category: string
          image_url?: string | null
          avatar_url?: string | null
          tags?: string[] | null
          votes_count?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          title?: string | null
          description?: string | null
          category?: string
          image_url?: string | null
          avatar_url?: string | null
          tags?: string[] | null
          votes_count?: number
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: number
          user_id: string
          nominee_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          nominee_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          nominee_id?: number
          created_at?: string
        }
      }
      events: {
        Row: {
          id: number
          title: string
          description: string | null
          date: string
          location: string | null
          image_url: string | null
          capacity: number | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          date: string
          location?: string | null
          image_url?: string | null
          capacity?: number | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          date?: string
          location?: string | null
          image_url?: string | null
          capacity?: number | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          role: "admin" | "user"
          created_at: string
        }
        Insert: {
          id: string
          role?: "admin" | "user"
          created_at?: string
        }
        Update: {
          id?: string
          role?: "admin" | "user"
          created_at?: string
        }
      }
      artistic_genres: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      academy_members: {
        Row: {
          id: number
          name: string
          title: string | null
          bio: string | null
          genre_id: number
          photo_url: string | null
          social_media: Json | null
          achievements: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          title?: string | null
          bio?: string | null
          genre_id: number
          photo_url?: string | null
          social_media?: Json | null
          achievements?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          title?: string | null
          bio?: string | null
          genre_id?: number
          photo_url?: string | null
          social_media?: Json | null
          achievements?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      content: {
        Row: {
          id: number
          section: string
          title: string
          content: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          section: string
          title: string
          content?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          section?: string
          title?: string
          content?: Json
          created_at?: string
          updated_at?: string
        }
      }
      config: {
        Row: {
          id: number
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
