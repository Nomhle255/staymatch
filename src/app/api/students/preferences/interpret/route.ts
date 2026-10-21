
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const PROPERTY_TYPES = [
  "SINGLE_ROOM",
  "DOUBLE",
  "COMMUNE",
  "BACHELOR",
] as const;

const PRICE_RANGES = [
  "Under M500",
  "M500 – M800",
  "M800 – M1,000",
  "Above M1,000",
] as const;

const FACTOR_KEYS = [
  "price",
  "distance",
  "wifi",
  "water",
  "electricity",
  "furnished",
  "parking",
  "security",
  "fenced",
  "burglar",
  "ceiling",
  "tile",
] as const;

const FACTOR_DESCRIPTIONS: Record<string, string> = {
  price: "Affordable price within the student's budget",
  distance: "Close to the student's university",
  wifi: "Wi-Fi availability",
  water: "Reliable water supply",
  electricity: "Reliable electricity",
  furnished: "Furnished accommodation",
  parking: "Parking availability",
  security: "Good security",
  fenced: "Fenced property",
  burglar: "Burglar bars",
  ceiling: "Ceiling",
  tile: "Tiled floors",
};

type ParsedPreferences = {
  propertyType?: (typeof PROPERTY_TYPES)[number];
  priceRange?: (typeof PRICE_RANGES)[number];
  maxDistance?: number;
  minMatch?: number;
  universityId?: string;
  ratings?: Record<string, number>;
};

function sanitizePreferences(raw: any): ParsedPreferences {
  const result: ParsedPreferences = {};

  if (
    PROPERTY_TYPES.includes(raw?.propertyType) 
  ) {
    result.propertyType = raw.propertyType;
  }

  if (PRICE_RANGES.includes(raw?.priceRange)) {
    result.priceRange = raw.priceRange;
  }

  if (
    typeof raw?.maxDistance === "number" &&
    Number.isFinite(raw.maxDistance) &&
    raw.maxDistance >= 0
  ) {
    result.maxDistance = Math.min(raw.maxDistance, 100);
  }

  if (
    typeof raw?.minMatch === "number" &&
    Number.isFinite(raw.minMatch)
  ) {
    result.minMatch = Math.max(0, Math.min(100, raw.minMatch));
  }

  if (typeof raw?.universityId === "string") {
    result.universityId = raw.universityId;
  }

  if (raw?.ratings && typeof raw.ratings === "object") {
    const ratings: Record<string, number> = {};

    for (const key of FACTOR_KEYS) {
      const value = raw.ratings[key];

      if (
        typeof value === "number" &&
        Number.isFinite(value) &&
        value >= 1 &&
        value <= 5
      ) {
        ratings[key] = value;
      }
    }

    if (Object.keys(ratings).length > 0) {
      result.ratings = ratings;
    }
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("staymatch_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Please log in to use AI accommodation search." },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Your session is invalid. Please log in again." },
        { status: 401 }
      );
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can use this feature." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : "";

    if (!description) {
      return NextResponse.json(
        { error: "Please describe the accommodation you need." },
        { status: 400 }
      );
    }

    if (description.length > 2000) {
      return NextResponse.json(
        { error: "Your description must be 2,000 characters or fewer." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is not configured.");

      return NextResponse.json(
        { error: "AI search is temporarily unavailable." },
        { status: 500 }
      );
    }

    const universities = await prisma.university.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const prompt = `
You extract student accommodation search preferences from natural language.

Return ONLY a valid JSON object with these optional fields:
{
  "propertyType": "SINGLE_ROOM" | "DOUBLE" | "COMMUNE" | "BACHELOR" | null,
  "priceRange": "Under M500" | "M500 – M800" | "M800 – M1,000" | "Above M1,000" | null,
  "maxDistance": number | null,
  "minMatch": number | null,
  "universityId": string | null,
  "ratings": {
    "price": number,
    "distance": number,
    "wifi": number,
    "water": number,
    "electricity": number,
    "furnished": number,
    "parking": number,
    "security": number,
    "fenced": number,
    "burglar": number,
    "ceiling": number,
    "tile": number,
    "burglar on windows": number,
    "burglar on doors": number
    burgar on both windows and doors: number
  }
}

Rules:
- Do not invent preferences the student did not express.
- Use a rating from 1 to 5 only for factors the student explicitly prioritizes.
- Treat "must have", "important", "prefer", "near", "affordable", and similar phrases as preference signals.
- Use maxDistance in kilometres only if the student states a distance.
- Choose the closest matching price range if a budget is stated.
- Map room descriptions to the closest valid propertyType.
- Use universityId only when the student identifies a university matching the provided list.
- Do not invent university IDs.
- Return null for unknown fields.
- Output JSON only.

Available universities:
${JSON.stringify(universities)}

Factor descriptions:
${JSON.stringify(FACTOR_DESCRIPTIONS)}

Student description:
${JSON.stringify(description)}
`;

    const aiResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model:
            process.env.GROQ_MODEL ??
            "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You extract structured accommodation preferences. Return valid JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Groq API error:", errorText);

      return NextResponse.json(
        { error: "Unable to interpret your preferences right now." },
        { status: 502 }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "The AI did not return usable preferences." },
        { status: 502 }
      );
    }

    let rawPreferences: any;

    try {
      rawPreferences = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "The AI returned an invalid response. Please try again." },
        { status: 502 }
      );
    }

    const preferences = sanitizePreferences(rawPreferences);

    if (preferences.universityId) {
      const universityExists = universities.some(
        (university) => university.id === preferences.universityId
      );

      if (!universityExists) {
        delete preferences.universityId;
      }
    }

    if (Object.keys(preferences).length === 0) {
      return NextResponse.json(
        {
          error:
            "I could not identify specific accommodation preferences. Please mention your budget, room type, location, or facilities.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      preferences,
      summary: "Your accommodation preferences have been interpreted.",
    });
  } catch (error) {
    console.error("AI preference interpretation error:", error);

    return NextResponse.json(
      { error: "Something went wrong while processing your preferences." },
      { status: 500 }
    );
  }
}
