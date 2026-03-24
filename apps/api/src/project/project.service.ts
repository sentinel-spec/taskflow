import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Project, WorkspaceRole, StateGroup } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, LogoPropsDto } from './dto/create-project.dto';
import { GenerateProjectDescriptionDto } from './dto/generate-project-description.dto';
import { AiService } from '@/ai/ai.service';
import { WebhookService, WebhookEvent } from '@/webhook/webhook.service';

type LogoProps = {
  in_use?: 'emoji' | 'icon' | null;
  emoji?: { value?: string | null } | null;
  icon?: { name?: string | null; color?: string | null } | null;
};

type ProjectWithLogoProps = Project & {
  logo_props: LogoProps;
};

type ProjectMemberView = {
  id: number;
  userId: number;
  projectId: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
};

const DEFAULT_ICON_COLOR = '#6d7b8a';
const BLOCKED_PROMPT_REGEX =
  /(steal\s+data|steal\s+credentials|credential\s+stuffing|botnet|ransomware|malware|keylogger|phishing|carding|ddos|sql\s*injection\s+attack|xss\s+attack|bypass\s+auth|backdoor|remote\s+code\s+execution|украсть\s+данные|украсть\s+доступ|фишинг|ботнет|шифровальщик|кейлоггер|ддос|обойти\s+аутентификац|сделать\s+бэкдор|внедрить\s+вредонос)/i;

const DEFAULT_STATES = [
  {
    name: 'Backlog',
    color: '#60646C',
    sequence: 10000,
    group: StateGroup.BACKLOG,
    default: true,
  },
  {
    name: 'Todo',
    color: '#60646C',
    sequence: 20000,
    group: StateGroup.UNSTARTED,
  },
  {
    name: 'In Progress',
    color: '#F59E0B',
    sequence: 30000,
    group: StateGroup.STARTED,
  },
  {
    name: 'Done',
    color: '#46A758',
    sequence: 40000,
    group: StateGroup.COMPLETED,
  },
  {
    name: 'Cancelled',
    color: '#9AA4BC',
    sequence: 50000,
    group: StateGroup.CANCELLED,
  },
];

const DEFAULT_ESTIMATE = {
  name: 'Fibonacci',
  points: [
    { key: 0, value: '0' },
    { key: 1, value: '1' },
    { key: 2, value: '2' },
    { key: 3, value: '3' },
    { key: 5, value: '5' },
    { key: 8, value: '8' },
    { key: 13, value: '13' },
    { key: 21, value: '21' },
  ],
};

function isMostlyCyrillic(text: string): boolean {
  const cyrillic = text.match(/[А-Яа-яЁё]/g)?.length ?? 0;
  const latin = text.match(/[A-Za-z]/g)?.length ?? 0;
  return cyrillic > latin;
}

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly webhookService: WebhookService,
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

  private sanitizeIdentifier(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64);
  }

  private async ensureUniqueIdentifier(
    workspaceId: number,
    baseIdentifier: string,
  ): Promise<string> {
    const cleanBase = this.sanitizeIdentifier(baseIdentifier);
    if (!cleanBase) {
      return this.generateNextProjectIdentifier(workspaceId);
    }

    let candidate = cleanBase;
    let suffix = 2;

    while (true) {
      const existing = await this.prisma.project.findFirst({
        where: {
          workspaceId,
          identifier: candidate,
        },
        select: {
          id: true,
        },
      });

      if (!existing) {
        return candidate;
      }

      candidate = `${cleanBase}-${suffix}`;
      suffix += 1;
    }
  }

  async create(
    workspaceId: number,
    createProjectDto: CreateProjectDto,
    userId: number,
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

    const requestedIdentifier =
      createProjectDto.identifier || createProjectDto.name;
    const identifier = await this.ensureUniqueIdentifier(
      workspaceId,
      requestedIdentifier,
    );

    const { logo_props, ...payload } = createProjectDto;
    const logoFields = this.buildLogoFields(logo_props);

    const project = await this.prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          ...payload,
          workspaceId,
          identifier,
          ...logoFields,
          members: {
            create: {
              userId,
            },
          },
        },
      });

      // Create default states for the new project
      await tx.state.createMany({
        data: DEFAULT_STATES.map((state) => ({
          ...state,
          projectId: newProject.id,
          slug: state.name.toLowerCase().replace(/\s+/g, '-'),
        })),
      });

      // Create default estimate for the new project
      await tx.estimate.create({
        data: {
          name: DEFAULT_ESTIMATE.name,
          projectId: newProject.id,
          points: {
            create: DEFAULT_ESTIMATE.points,
          },
        },
      });

      return newProject;
    });

    // Trigger Webhook
    this.webhookService.trigger(
      workspaceId,
      WebhookEvent.PROJECT_CREATED,
      project,
    );

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
      include: {
        workspace: {
          include: {
            members: {
              where: {
                role: WorkspaceRole.OWNER,
              },
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
        members: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        states: {
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    const members = project.members as ProjectMemberView[];
    const ownerMember = project.workspace.members[0];
    const authorUser = members[0]?.user || ownerMember?.user || null;

    return {
      ...this.attachLogoProps(project),
      members,
      membersCount: members.length,
      author: authorUser,
      states: project.states,
    };
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

    const projectName = payload.projectName?.trim() || '';
    const prompt = payload.prompt.trim();
    const projectContext = projectName
      ? `Project name context: ${projectName}.`
      : '';
    const languageHint = isMostlyCyrillic(`${projectName} ${prompt}`)
      ? 'User language is Russian. Use only Russian words for all headings and content.'
      : 'User language is English. Use only English words for all headings and content.';
    const sectionHint = isMostlyCyrillic(`${projectName} ${prompt}`)
      ? 'Use Russian section labels like: Обзор, Целевая аудитория, Ключевые функции, Шаги, Ожидаемый результат.'
      : 'Use English section labels like: Overview, Target users, Key features, Steps, Expected outcome.';

    if (BLOCKED_PROMPT_REGEX.test(prompt)) {
      throw new BadRequestException(
        'Запрос отклонен. Разрешены только безопасные запросы, связанные с описанием проекта.',
      );
    }

    const generatedText = await this.aiService.generateText({
      prompt,
      systemPrompt:
        `You are a product writing assistant. The user gives a short product idea. Expand it into a practical, detailed project description.
Strict rules:
- Reply in the same language as the user input.
- Do not mix languages in one response.
- Return only task-oriented output.
- Use concise task statements and actionable steps.
- Keep plain text only.
- 6-10 lines total.
- If the user asks for steps, include a concise step-by-step plan.
- Never provide harmful, illegal, or security abuse guidance.
- Do not use markdown syntax like #, **, or numbered lists.
${languageHint}
${sectionHint}
If user language is Russian, use labels like: 🎯 Задача, ⚙️ Шаги, ✅ Результат.
If user language is English, use labels like: 🎯 Task, ⚙️ Steps, ✅ Outcome.
${projectContext}`.trim(),
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

  async toggleFavorite(projectId: number, userId: number) {
    const favorite = await this.prisma.projectFavorite.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (favorite) {
      await this.prisma.projectFavorite.delete({
        where: { id: favorite.id },
      });
      return { favorited: false };
    } else {
      await this.prisma.projectFavorite.create({
        data: { userId, projectId },
      });
      return { favorited: true };
    }
  }

  async findFavorites(userId: number) {
    const favorites = await this.prisma.projectFavorite.findMany({
      where: { userId },
      include: {
        project: true,
      },
    });

    return favorites.map((f) => this.attachLogoProps(f.project));
  }

  async remove(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { workspaceId: true },
    });

    const deletedProject = await this.prisma.project.delete({
      where: { id },
    });

    if (project) {
      this.webhookService.trigger(
        project.workspaceId,
        WebhookEvent.PROJECT_DELETED,
        deletedProject,
      );
    }

    return deletedProject;
  }
}
