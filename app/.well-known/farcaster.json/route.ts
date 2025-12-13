import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {

    accountAssociation: {
      header: "eyJmaWQiOjE1NzA0MjcsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhjMmRlODM1ODFlRWJGMTRCNjNCODhFOGJGN0VkMzJmRjUzMWQzYzZlIn0",
      payload: "eyJkb21haW4iOiJibGl0enh2YWliYXZLnZlcmNlbC5hcHAifQ",
      signature: "KOVb7D8Cqu/wYS1LF9+kU4ga91+FMntptTQiGRwkChNR/GphPrJPTYA8+NqdQo0fme3EQTRPfhKMAwA1o7CprBs="
    },
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
