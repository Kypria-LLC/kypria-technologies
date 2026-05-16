# Godly Zeus — Founding Tier Organic Launch

Three-post organic A/B/C test. Same 12-second reel, three different hook captions, staggered Wed/Fri/Sun. Decision by Day 7.

## Asset

- File: `godly_zeus_founding_reel.mp4`
- Duration: 12s
- Format: 9:16 vertical (1080×1920 native from Sora)
- Audio: Zeus VO (ElevenLabs adam, deep authoritative male) + ambient storm bed
- Visual: storm → obsidian throne → 50-seat row, first seat pulsing → 1/50 counter

## Posting schedule (America/New_York)

| Day | Date | Time | Hook | UTM content |
|---|---|---|---|---|
| Wed | May 13, 2026 | 7:00 PM | A — scarcity | `hook_a_scarcity` |
| Fri | May 15, 2026 | 7:00 PM | B — invitation | `hook_b_invitation` |
| Sun | May 17, 2026 | 11:00 AM | C — locked price | `hook_c_locked` |

Post on **Facebook Page Godly Zeus AI** (canonical Page ID `1058205557375892`; public URL form `61576793849282` resolves to the same Page — verified via Business Settings 2026-05-12 22:07 EDT). Cross-post to **Instagram @godlyzeus.ai** as a Reel using Meta Business Suite's native cross-posting. Do NOT post to the other Page `809223708930617` — that's the individually-owned cleanup target.

Tracking link in every caption uses the same Stripe payment link with a unique `utm_content` so you can attribute clicks back to the winning hook.

---

## Hook A — Scarcity (post Wed May 13, 7:00 PM ET)

```
50 thrones. One bears your name.

The Temple of Kypria opens tonight. $19 a month, locked forever. The first warrior claims their seat.

Will it be you?

Claim a throne: https://buy.stripe.com/4gMbJ0chN2RF0FH0kd1gs0P?utm_source=fb_organic&utm_medium=reel&utm_campaign=founding_launch&utm_content=hook_a_scarcity

#GodlyZeus #FoundingMember #MythicAI
```

---

## Hook B — Invitation (post Fri May 15, 7:00 PM ET)

```
The storm gathers. The throne waits.

50 founding seats. Locked at $19/mo for as long as you stay. After the 50, the gates close at this price forever.

You were not summoned by accident.

Take your seat: https://buy.stripe.com/4gMbJ0chN2RF0FH0kd1gs0P?utm_source=fb_organic&utm_medium=reel&utm_campaign=founding_launch&utm_content=hook_b_invitation

#GodlyZeus #Founding #DivineStrategy
```

---

## Hook C — Locked price (post Sun May 17, 11:00 AM ET)

```
$19 a month. Locked forever. 50 seats.

The throne does not wait. The price never returns.

If you are the first, the temple remembers your name.

Lock your seat: https://buy.stripe.com/4gMbJ0chN2RF0FH0kd1gs0P?utm_source=fb_organic&utm_medium=reel&utm_campaign=founding_launch&utm_content=hook_c_locked

#FoundingMember #GodlyZeus #Olympus
```

---

## Day-7 decision protocol (May 20, 2026)

Pull these four numbers per post from Meta Business Suite + Stripe:

| Metric | Source | Notes |
|---|---|---|
| Reach | FB/IG Insights → post | Organic reach only |
| Reel completions | FB/IG Insights → video | 3-second views and 100% completion |
| Outbound clicks | UTM-tagged Stripe link | Look up by `utm_content` in Stripe Sessions or GA4 |
| Subscriptions started | Stripe → Subscriptions filtered by `utm_content` metadata | Real conversion |

Winner = highest **subscriptions per 1k reach** (cost-free CPA proxy). If no subs across all three, winner = highest **clicks per 1k reach** and we re-test creative on May 26+ paid run.

## After winner is called

1. Save the winning hook copy block to the `kypria-persona-reply` skill as the canonical Founding tier organic template.
2. Use the winning hook as the primary ad creative variant when paid Phase 2 launches post-cooldown (~May 26+).
3. Retire the other two hooks from the organic rotation.

## Reminder

- Founding tier cap is 50 seats. Seat-cap cron `1853ff0d` runs hourly and will push notify at 40/50 and 50/50.
- Pixel 1024027273624000 fires the Lead event on quiz email submit and PageView on every page — every click from these posts is attributable post-Phase 1B partner-share.
