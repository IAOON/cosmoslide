import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class InvitationController {
  constructor(
    private invitationService: InvitationService,
    private mailService: MailService,
  ) {}

  @Get()
  async getMyInvitations(@Request() req) {
    const invitations = await this.invitationService.getUserInvitations(
      req.user.id,
    );
    const quota = await this.invitationService.getUserQuota(req.user.id);

    return {
      invitations: invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        code: inv.code,
        note: inv.note,
        expiresAt: inv.expiresAt,
        usedCount: inv.usedCount,
        maxUses: inv.maxUses,
        createdAt: inv.createdAt,
        usedBy: inv.usedBy
          ? {
              id: inv.usedBy.id,
              username: inv.usedBy.username,
              displayName: inv.usedBy.displayName,
            }
          : null,
        usedAt: inv.usedAt,
        isValid: inv.isValid,
      })),
      quota,
    };
  }

  @Post()
  async sendInvitation(
    @Request() req,
    @Body('email') email: string,
    @Body('message') message?: string,
  ) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // Validate message length
    if (message && message.length > 500) {
      throw new BadRequestException('Message must be 500 characters or less');
    }

    const invitation = await this.invitationService.sendInvitation(
      req.user,
      email,
      message,
    );

    // Generate invitation URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const invitationUrl = `${frontendUrl}/auth/signup?invitation=${invitation.code}`;

    // Send invitation email
    await this.mailService.sendInvitation(
      email,
      req.user,
      invitationUrl,
      message,
    );

    return {
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        code: invitation.code,
        expiresAt: invitation.expiresAt,
      },
    };
  }
}
