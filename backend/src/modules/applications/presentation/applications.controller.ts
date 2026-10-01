import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { ApplicationsService } from "../application/applications.service";
import { ApiInput, parse, text } from "../../../shared/validation";
const supplier = z
  .object({
    companyName: text(150).min(2),
    contactName: text(100).optional(),
    phone: text(25)
      .regex(/^[+0-9 ()-]{10,25}$/)
      .optional(),
    email: z.email().max(254).optional(),
    contact: text(254).min(5).optional(),
    category: text(80).min(1),
    skuCount: text(40).optional(),
    dailyCapacity: text(40).optional(),
    monthlyCapacity: text(60).optional(),
    integration: z.enum(["xml", "excel", "api"]).optional(),
  })
  .strict()
  .refine(
    (value) =>
      !!value.contact ||
      (!!value.phone && !!value.email && !!value.contactName),
    "İletişim bilgilerini doldurun.",
  );
const influencer = z
  .object({
    name: text(100).min(2),
    phone: text(25)
      .regex(/^[+0-9 ()-]{10,25}$/)
      .optional(),
    email: z.email().max(254).optional(),
    platform: text(40).optional(),
    profile: text(300).min(2),
    followers: text(80).min(1),
    category: text(80).min(1),
    partnershipType: z.enum(["coupon", "affiliate", "boutique"]).optional(),
  })
  .strict();
@ApiTags("applications")
@Controller("applications")
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}
  @Post("supplier") @ApiInput(supplier) supplier(@Body() body: unknown) {
    return this.applications.submit("supplier", parse(supplier, body));
  }
  @Post("influencer") @ApiInput(influencer) influencer(@Body() body: unknown) {
    return this.applications.submit("influencer", parse(influencer, body));
  }
}
