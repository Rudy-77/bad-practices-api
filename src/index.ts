import { Elysia, status, t } from "elysia";
import { z } from "zod";

const loginSchema = z.object({
  curp: z.string(),
  password: z.string().min(8),
});
const UserSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  curp: z.string(),
  rfc: z.string().min(12).length(13),
  password: z.string().min(8),
});
// Generación de datos simulados
const bankUsers = [];

const firstNames = ["Juan", "Maria", "Pedro", "Ana", "Luis", "Sofia", "Carlos", "Elena"];
const lastNames = ["Garcia", "Rodriguez", "Hernandez", "Lopez", "Martinez", "Gonzalez", "Perez"];
const addresses = ["Av. Reforma", "Calle 5 de Mayo", "Insurgentes Sur", "Av. Juarez", "Calle Madero"];

function generateRandomUser(id: number) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const address = `${addresses[Math.floor(Math.random() * addresses.length)]} #${Math.floor(Math.random() * 1000)}`;
  
  return {
    id,
    name: `${firstName} ${lastName}`,
    balance: Math.floor(Math.random() * 1000000) / 100,
    address,
    curp: `CURP${id}${Date.now().toString().slice(-4)}`,
    rfc: `RFC${id}${Date.now().toString().slice(-4)}`,
    password: `pass${Math.floor(Math.random() * 10000)}`, 
  };
}

for (let i = 1; i <= 100; i++) {
  bankUsers.push(generateRandomUser(i));
}

// TODO: Resolver malas prácticas de seguridad
const app = new Elysia()
  .get("/users", ({ set }) => {
    set.status = 200;
    return { message: "Operación exitosa" };
  })
  .get("/users/:id", ({ params: { id }, status }) => {
    const user = bankUsers.find((u) => u.id == id);
    if (!user) {
      console.log("Usuario no encontrado");
      return status(404);
    }
    return status(200);
  })
  .post("/users", ({ body, set }) => {
    const result = UserSchema.safeParse(body);
    if (!result.success) {
      set.status = 400; 
      return { error: "Datos inválidos"};
    }
    const newUser = { 
      ...result.data, 
      id: bankUsers.length + 1, 
      balance: 0 
    };
    bankUsers.push(newUser);
    set.status = 201;
    return { message: "Usuario creado exitosamente"}; 
  })
  .put("/users/:id", ({ params: { id }, body, set }) => {
    const index = bankUsers.findIndex((u) => u.id == id);
    if (index === -1) {
      console.log("Usuario no encontrado");
      return status(404);
    }
    const result = UserSchema.partial().safeParse(body);
    if (!result.success) {
      console.log("Datos inválidos");
      return status(400);
    }
    bankUsers[index] = { ...bankUsers[index], ...result.data };
      console.log("Usuario actualizado");
      return status(200);
  })
  .delete("/users/:id", ({ params: { id }, status }) => {
    const index = bankUsers.findIndex((u) => u.id == id);
    if (index === -1) {
      console.log("Usuario no encontrado");
      return status(404);
    }
    bankUsers.splice(index, 1);
    return status(200);
  })
  .post("/login", ({ body, set }) => {
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      console.log("Formato de login inválido");
      return status(401);
    }
    const { curp, password } = result.data;
    const user = bankUsers.find((u) => u.curp === curp && u.password === password);
    if (!user) {
      console.log("Credenciales incorrectas");
      return status(401);
    }
      console.log("Login exitoso");
      return status(200);
  })
  .listen(3000);




console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
