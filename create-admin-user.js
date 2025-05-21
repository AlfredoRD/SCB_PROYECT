import { createClient } from "@supabase/supabase-js"

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Se requieren las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

// Crear cliente de Supabase con la clave de servicio para tener acceso administrativo
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  // Datos del usuario administrador
  const adminEmail = "admin@premiossancristobal.com"
  const adminPassword = "Admin123456"
  const adminName = "Administrador"

  try {
    // 1. Crear el usuario
    console.log(`Creando usuario administrador: ${adminEmail}`)
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Confirmar el email automáticamente
      user_metadata: { name: adminName },
    })

    if (userError) {
      throw new Error(`Error al crear usuario: ${userError.message}`)
    }

    console.log("Usuario creado exitosamente:", userData.user.id)

    // 2. Asignar rol de administrador
    console.log("Asignando rol de administrador...")
    const { error: profileError } = await supabase.from("user_profiles").upsert({
      id: userData.user.id,
      role: "admin",
      created_at: new Date().toISOString(),
    })

    if (profileError) {
      throw new Error(`Error al asignar rol de administrador: ${profileError.message}`)
    }

    console.log("¡Usuario administrador creado exitosamente!")
    console.log("----------------------------------------")
    console.log("Credenciales de administrador:")
    console.log(`Email: ${adminEmail}`)
    console.log(`Contraseña: ${adminPassword}`)
    console.log("----------------------------------------")
  } catch (error) {
    console.error("Error:", error.message)

    // Intentar verificar si el usuario ya existe
    try {
      const { data: existingUser } = await supabase.auth.admin.listUsers()
      const admin = existingUser?.users?.find((user) => user.email === adminEmail)

      if (admin) {
        console.log("El usuario administrador ya existe.")
        console.log("----------------------------------------")
        console.log("Credenciales de administrador:")
        console.log(`Email: ${adminEmail}`)
        console.log(`Contraseña: ${adminPassword} (si no funciona, restablezca la contraseña)`)
        console.log("----------------------------------------")
      }
    } catch (listError) {
      console.error("Error al verificar usuarios existentes:", listError.message)
    }
  }
}

// Ejecutar la función
createAdminUser()
