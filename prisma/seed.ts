import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Criando dados de demonstração...");

  // Garante que a sequência de vendas existe
  await prisma.saleSequence.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, lastNum: 0 },
  });

  // Produtos de demonstração
  const products = [
    { code: "001", name: "Camiseta", quantity: 10, price: 3000 },
    { code: "002", name: "Calça Jeans", quantity: 5, price: 7000 },
    { code: "003", name: "Vestido", quantity: 3, price: 9000 },
    { code: "004", name: "Blusa", quantity: 8, price: 4500 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: {},
      create: product,
    });
    console.log(`  Produto criado: ${product.code} — ${product.name}`);
  }

  console.log("\nDados de demonstração criados com sucesso!");
  console.log("Acesse http://localhost:3000 para começar.");
}

main()
  .catch((e) => {
    console.error("Erro ao criar seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
