import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { ApiInput, parse, text } from "../../../shared/validation";
import { ContactService } from "../application/contact.service";
const input = z
  .object({
    name: text(100).min(2),
    email: z.email().max(254),
    phone: text(25).refine((s) => !s || /^\+?[\d\s()-]{7,25}$/.test(s)),
    store: text(200),
    topic: z.enum([
      "store",
      "supplier",
      "influencer",
      "technical",
      "corporate",
    ]),
    message: text(3000).min(20),
    consent: z.literal(true),
  })
  .strict();
@ApiTags("contact")
@Controller("contact")
export class ContactController {
  constructor(private readonly contact: ContactService) {}
  @Post() @ApiInput(input) submit(@Body() body: unknown) {
    return this.contact.submit(parse(input, body));
  }
}
