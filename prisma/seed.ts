import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const roles = [
	{ name: 'STUDENT', label: 'Student', selfAssignable: true },
	{ name: 'LANDLORD', label: 'Landlord', selfAssignable: true },
	{ name: 'ADMINISTRATOR', label: 'Administrator', selfAssignable: false },
]

async function main() {
	for (const role of roles) {
		await prisma.role.upsert({
			where: { name: role.name },
			update: { label: role.label, selfAssignable: role.selfAssignable },
			create: role,
		})
	}
	console.log('Roles seeded.')
}

main()
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())