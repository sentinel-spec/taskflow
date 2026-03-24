import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PageService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: number, userId: number, dto: CreatePageDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.page.create({
      data: {
        ...dto,
        projectId,
        ownedById: userId,
      },
    });
  }

  async findAll(projectId: number) {
    return this.prisma.page.findMany({
      where: { projectId, parentPageId: null }, // Return root pages only for tree view
      orderBy: { createdAt: 'desc' },
      include: {
        childPages: true,
        ownedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        project: true,
        ownedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        parentPage: true,
        childPages: {
          include: {
            ownedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async update(id: number, dto: UpdatePageDto) {
    return this.prisma.page.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.prisma.page.delete({ where: { id } });
    return { success: true };
  }
}
