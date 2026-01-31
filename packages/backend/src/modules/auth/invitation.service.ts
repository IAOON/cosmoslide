import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation, User } from '../../entities';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createInvitation(
    invitedBy: User,
    data: {
      email?: string;
      maxUses?: number;
      expiresAt?: Date;
      note?: string;
    },
  ): Promise<Invitation> {
    const code = this.generateInvitationCode();

    const invitation = this.invitationRepository.create({
      code,
      invitedBy,
      invitedById: invitedBy.id,
      ...data,
    });

    return await this.invitationRepository.save(invitation);
  }

  async sendInvitation(
    inviter: User,
    email: string,
    message?: string,
  ): Promise<Invitation> {
    // Check if inviter has quota
    if (inviter.invitationQuota <= 0) {
      throw new BadRequestException('No invitation quota remaining');
    }

    // Create single-use invitation with 7-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.createInvitation(inviter, {
      email,
      maxUses: 1,
      expiresAt,
      note: message,
    });

    // Decrement quota atomically
    await this.userRepository.decrement(
      { id: inviter.id },
      'invitationQuota',
      1,
    );

    return invitation;
  }

  async getUserQuota(userId: string): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user?.invitationQuota ?? 0;
  }

  async validateInvitation(code: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { code },
      relations: ['invitedBy'],
    });

    if (!invitation) {
      throw new BadRequestException('Invalid invitation code');
    }

    if (!invitation.isValid) {
      throw new BadRequestException('Invitation is no longer valid');
    }

    return invitation;
  }

  async useInvitation(invitation: Invitation, user?: User): Promise<void> {
    invitation.usedCount += 1;
    if (user) {
      invitation.usedBy = user;
      invitation.usedById = user.id;
      invitation.usedAt = new Date();
    }
    await this.invitationRepository.save(invitation);
  }

  private generateInvitationCode(): string {
    return randomBytes(16).toString('base64url');
  }

  async getInvitationByCode(code: string): Promise<Invitation | null> {
    return await this.invitationRepository.findOne({
      where: { code },
      relations: ['invitedBy'],
    });
  }

  async getUserInvitations(userId: string): Promise<Invitation[]> {
    return await this.invitationRepository.find({
      where: { invitedById: userId },
      relations: ['usedBy'],
      order: { createdAt: 'DESC' },
    });
  }
}
