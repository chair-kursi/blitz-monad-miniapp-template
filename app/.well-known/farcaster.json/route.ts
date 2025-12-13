import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {
    // TODO: Add your own account association
    frame: {
      version: "1",
      name: "Typing Tournament",
      iconUrl: `${APP_URL}/images/icon.png`,
      homeUrl: `${APP_URL}/game`,
      imageUrl: `${APP_URL}/images/feed.png`,
      screenshotUrls: [],
      tags: ["game", "typing", "monad", "tournament", "multiplayer"],
      primaryCategory: "games",
      buttonTitle: "Play Now",
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: "#0F172A",
      webhookUrl: `${APP_URL}/api/webhook`,
    },
  };

  return NextResponse.json(farcasterConfig);
}
