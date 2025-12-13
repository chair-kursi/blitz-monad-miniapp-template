import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {

    accountAssociation: {
      header: "eyJmaWQiOjE1NzA0MjcsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhjNkZkNzI4QkYzZTc5MDFmQ0M5RDU1RDliMDgyMjExZWRBNkUzOUVGIn0",
      payload: "eyJkb21haW4iOiJibGl0enh2YWliaGF2LnZlcmNlbC5hcHAifQ",
      signature: "BYcBlfLvCQY6AFF1B4svoOquFM5W4GbV2TVok7jFy1hV8XpCYoMv2m9amcPqA4BiCTSi/GfuV4VHcLj90FieHxs="
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
