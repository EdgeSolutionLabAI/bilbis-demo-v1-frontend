import { NextResponse } from "next/server";

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

export async function GET() {
  return NextResponse.json({
    dice1: rollDie(),
    dice2: rollDie(),
  });
}
