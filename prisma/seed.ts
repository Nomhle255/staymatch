import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
	throw new Error('DATABASE_URL is not defined.')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const roles = [
	{ name: 'STUDENT', label: 'Student', selfAssignable: true },
	{ name: 'LANDLORD', label: 'Landlord', selfAssignable: true },
	{ name: 'ADMINISTRATOR', label: 'Administrator', selfAssignable: false },
]

const administrator = {
	name: ' Administrator StayMatch',
	email: 'admin@staymatch.com',
	password: 'admin@123',
}

async function main() {
	for (const role of roles) {
		await prisma.role.upsert({
			where: { name: role.name },
			update: { label: role.label, selfAssignable: role.selfAssignable },
			create: role,
		})
	}

	const administratorRole = await prisma.role.findUniqueOrThrow({
		where: { name: 'ADMINISTRATOR' },
	})
	const passwordHash = await bcrypt.hash(administrator.password, 10)

	await prisma.user.upsert({
		where: { email: administrator.email },
		update: {
			name: administrator.name,
			passwordHash,
			roleId: administratorRole.id,
		},
		create: {
			name: administrator.name,
			email: administrator.email,
			passwordHash,
			roleId: administratorRole.id,
		},
	})
	console.log(`Administrator account seeded for ${administrator.email}.`)
}

main()
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())