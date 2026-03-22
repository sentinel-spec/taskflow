import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, LogoPropsDto } from './dto/create-project.dto';
import { GenerateProjectDescriptionDto } from './dto/generate-project-description.dto';
import { AiService } from '@/ai/ai.service';

type LogoProps = {
  in_use?: 'emoji' | 'icon' | null;
  emoji?: { value?: string | null } | null;
  icon?: { name?: string | null; color?: string | null } | null;
};

type ProjectWithLogoProps = Project & {
  logo_props: LogoProps;
};

const DEFAULT_ICON_COLOR = '#6d7b8a';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  private buildLogoFields(logoProps?: LogoPropsDto) {
    if (logoProps?.in_use === 'emoji' && logoProps?.emoji?.value) {
      return {
        logoType: 'emoji',
        icon: logoProps.emoji.value,
        color: null,
      };
    }

    if (logoProps?.in_use === 'icon' && logoProps.icon?.name) {
      return {
        logoType: 'icon',
        icon: logoProps.icon.name,
        color: logoProps.icon.color || DEFAULT_ICON_COLOR,
      };
    }

    return {
      logoType: null,
      icon: null,
      color: null,
    };
  }

  private mapLogoProps(project: Project): LogoProps {
    if (project.logoType === 'emoji' && project.icon) {
      return {
        in_use: 'emoji',
        emoji: { value: project.icon },
      };
    }

    if (project.logoType === 'icon' && project.icon) {
      return {
        in_use: 'icon',
        icon: {
          name: project.icon,
          color: project.color || DEFAULT_ICON_COLOR,
        },
      };
    }

    return {
      in_use: null,
    };
  }

  private attachLogoProps(project: Project): ProjectWithLogoProps {
    return {
      ...project,
      logo_props: this.mapLogoProps(project),
    };
  }

  async create(workspaceId: number, createProjectDto: CreateProjectDto) {
    const identifier = await this.generateNextProjectIdentifier(workspaceId);

    const { logo_props, ...payload } = createProjectDto;
    const logoFields = this.buildLogoFields(logo_props);

    const project = await this.prisma.project.create({
      data: {
        ...payload,
        workspaceId,
        identifier,
        ...logoFields,
      },
    });

    return this.attachLogoProps(project);
  }

  async findAll(workspaceId: number) {
    const projects = await this.prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => this.attachLogoProps(project));
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { workspace: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return this.attachLogoProps(project);
  }

  async generateDescriptionDraft(
    userId: number,
    workspaceId: number,
    payload: GenerateProjectDescriptionDto,
  ) {
    const membership = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    const projectName = payload.projectName?.trim() || 'New Project';
    const prompt = payload.prompt.trim();

    const generatedText = await this.aiService.generateText({
      prompt: `Project name: ${projectName}\nRequest: ${prompt}`,
      systemPrompt:
        'You are an assistant for product teams. Generate a concise, clear project description in plain text. Return only the description text.',
    });

    return { generatedText };
  }

  private async generateNextProjectIdentifier(
    workspaceId: number,
  ): Promise<string> {
    const prefix = 'PROJ';

    const projects = await this.prisma.project.findMany({
      where: { workspaceId },
      select: { identifier: true },
    });

    if (!projects.length) {
      return `${prefix}-00001`;
    }

    let maxNumber = 0;
    for (const project of projects) {
      const match = project.identifier.match(/^PROJ-(\d+)$/);
      if (match) {
        const value = parseInt(match[1], 10);
        if (value > maxNumber) {
          maxNumber = value;
        }
      }
    }

    const nextNumber = maxNumber + 1;
    const padded = `${nextNumber}`.padStart(5, '0');
    return `${prefix}-${padded}`;
  }
}
