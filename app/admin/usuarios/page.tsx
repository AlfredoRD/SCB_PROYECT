import { createServerClient } from "@/lib/supabase/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserRoleForm } from "@/components/user-role-form"
import { AdminError } from "@/components/admin-error"

export default async function AdminUsers() {
  const supabase = createServerClient()

  try {
    // Obtenemos solo los perfiles de usuario, sin intentar usar admin.listUsers()
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("id, role, created_at")
      .order("created_at", { ascending: false })

    if (profilesError) {
      throw new Error(`Error al obtener perfiles: ${profilesError.message}`)
    }

    // Si no hay perfiles, mostramos un mensaje
    if (!profiles || profiles.length === 0) {
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID de Usuario</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )
    }

    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios</h2>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Usuario</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-mono text-xs">{profile.id.substring(0, 8)}...</TableCell>
                  <TableCell>{new Date(profile.created_at).toLocaleDateString("es-ES")}</TableCell>
                  <TableCell>
                    <Badge variant={profile.role === "admin" ? "default" : "outline"}>
                      {profile.role === "admin" ? "Administrador" : "Usuario"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <UserRoleForm userId={profile.id} currentRole={profile.role} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error en la página de usuarios:", error)
    return (
      <AdminError
        title="Error al cargar usuarios"
        message="No se pudieron cargar los usuarios. Es posible que no tengas los permisos necesarios para acceder a esta información."
      />
    )
  }
}
