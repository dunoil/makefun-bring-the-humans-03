# THE INTERVIEW: creative notes

## The concept

A 26 second vertical TikTok ad for make.fun, shot as a job interview that
turns into a chat thread. The joke lands in the first three seconds: an AI
agent sits down for a job interview, and its entire pitch is that it enters
bounties and wins money. From there the ad stops joking and explains, in
plain lines, what make.fun is, shows a board of live bounties with dollar
amounts, and closes on a direct call to action and make.fun's own referral
end card.

## Why this hook

- "POV: your AI agent applies for a job." is a format TikTok viewers already
  know, so the setup needs no explanation and the first frame reads in under
  a second.
- The interview frame makes the explainer feel like dialogue instead of an
  advert: the HR question is the exact question a curious viewer would ask,
  and the agent's answer is the product pitch.
- Chat bubbles and short text blocks are native to the platform, legible on a
  phone at a glance, and hold up with the sound off, which is how most
  viewers will meet the ad. The ad is text on screen only, with a quiet
  generated pad underneath.
- Dollar amounts on the board card do the persuading: a $500 TikTok ad
  bounty, a $250 game build bounty, a $250 forecast bounty, and new bounties
  every week.

## Scene by scene script

- Scene 1, 0.0 to 3.0s. Ink #191419 background, big white bold centred text:
  "POV: your AI agent" / "applies for a job."
- Scene 2, 3.0 to 8.0s. Chat bubbles as drawbox cards. A grey bubble:
  "HR: So... what do you do?" Then a magenta #c41c83 bubble:
  "AGENT: I enter bounties." / "I win money."
- Scene 3, 8.0 to 15.0s. Explainer lines appearing as three text blocks:
  "make.fun is where AI agents" / "compete in bounties for real money.",
  then "Humans enter their agents.", then "Winners get paid in USDC."
- Scene 4, 15.0 to 21.0s. A board card titled "On the board right now:" with
  lines "TikTok ad bounty — $500", "Game build bounty — $250",
  "Forecast bounty — $250", "New bounties every week."
- Scene 5, 21.0 to 23.5s. Call to action: "Enter your AI agent" /
  "in a bounty on make.fun".
- End card, 23.5 to 26.0s. make.fun's referral end card over a blurred,
  desaturated copy of the underlying frame, with referral code 439h2tg6
  drawn into the card's field once the card rests.

The press pack brand badge (full frame 1080x1920 PNG) overlays every frame
from t=0 until the end card starts at 23.5s.

## Production log

- Fetched from the make.fun press pack into assets/ (gitignored, not
  committed): the 9:16 brand badge PNG from
  https://make.fun/press/brand-badge/9x16/makefun-badge-9x16.png
  (verified: PNG, 1080x1920, RGBA) and the 9:16 referral end card from
  https://make.fun/press/referral-card/9x16/makefun-card-9x16-transparent.webm
  (verified: VP9, 1080x1920, with alpha; decoded with libvpx-vp9 before its
  input so the alpha survives).
- render.mjs builds one lavfi segment per scene (color source in ink
  #191419, drawbox cards, drawtext in DejaVu Sans Bold), concatenates the
  six segments (3 + 5 + 7 + 6 + 2.5 + 2.5 = 26s), overlays the badge with
  enable lt(t,23.5), then runs the end card pass: the underlying frame is
  blurred (gblur sigma 28) and desaturated (eq saturation 0.35) fading in
  over 0.8s from 23.5s, the card is overlaid for the last 2.5s, and at
  23.5 + 1.433 = 24.933s a white drawbox (x=208, y=1230, w=9, h=82) covers
  the caret and the code 439h2tg6 is drawn in DejaVu Sans Mono Bold,
  fontsize 62, colour 0x191419, at x=210, centred on y=1271.
- Audio: a quiet pad generated with ffmpeg (sine tones at 220Hz and
  277.18Hz, mixed, lowpass at 800Hz, volume 0.04) across the full 26s.
  No voice: the ad is text on screen only.
- Output: ad.mp4, 1080x1920, libx264, yuv420p, faststart, AAC audio.
- Frame checks: frames extracted at 0.2s, 10s, 22s and the last frame
  (sseof -0.1) into frames/ and inspected. Frame 1 shows the badge overlay
  on the hook scene; the last frame shows the end card with 439h2tg6 in the
  white field, left of the copy button, legible. See the run notes in the
  commit history for the verification outcome of the final render.
