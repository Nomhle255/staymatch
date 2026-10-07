import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
	try {
		const { image } = await request.json()

		if (!image) {
			return NextResponse.json(
				{ error: 'No image provided.' },
				{ status: 400 },
			)
		}

		const result = await cloudinary.uploader.upload(image, {
			folder: 'staymatch/accommodations',
		})

		return NextResponse.json({ url: result.secure_url })
	} catch (error) {
		console.error('Cloudinary upload failed:', error)

		return NextResponse.json(
			{ error: 'Failed to upload image.' },
			{ status: 500 },
		)
	}
}