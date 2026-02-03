import { Elysia, t } from "elysia";

// Generación de datos simulados
const bankUsers = [];

// Helper to generate random data
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
  .get("/users", () => bankUsers)
  .get("/users/:id", ({ params: { id } }) => {
    const user = bankUsers.find((u) => u.id == id);
    return user;
  })
  .post("/users", ({ body }) => {
    const newUser = body;
    newUser.id = bankUsers.length + 1
    bankUsers.push(newUser);
    return newUser;
  })
  .put("/users/:id", ({ params: { id }, body }) => {
    const index = bankUsers.findIndex((u) => u.id == id);
    const updatedUser = { ...bankUsers[index], ...body };
    bankUsers[index] = updatedUser;
    return updatedUser;
  })
  .delete("/users/:id", ({ params: { id } }) => {
    const index = bankUsers.findIndex((u) => u.id == id);
    const deletedUser = bankUsers.splice(index, 1);
    return deletedUser[0];
  })
  .post("/login", ({ body }) => {
    const { curp, password } = body;
    const user = bankUsers.find((u) => u.curp == curp && u.password == password);
    return user
  })
  .listen(3000);




console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
