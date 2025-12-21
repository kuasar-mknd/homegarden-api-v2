import { Diagnosis, type DiagnosisStatus } from '../../domain/entities/diagnosis.entity.js'
import type {
  CreateDiagnosisData,
  DiagnosisRepository,
  UpdateDiagnosisData,
} from '../../domain/repositories/diagnosis.repository.js'
import { prisma } from '../database/prisma.client.js'

export class PrismaDiagnosisRepository implements DiagnosisRepository {
  async create(data: CreateDiagnosisData): Promise<Diagnosis> {
    const diagnosis = await prisma.diagnosis.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    })
    return Diagnosis.fromPersistence({
      ...diagnosis,
      rawResponse: diagnosis.rawResponse as Record<string, unknown> | null,
    })
  }

  async findById(id: string): Promise<Diagnosis | null> {
    const diagnosis = await prisma.diagnosis.findUnique({
      where: { id },
    })
    if (!diagnosis) return null
    return Diagnosis.fromPersistence({
      ...diagnosis,
      rawResponse: diagnosis.rawResponse as Record<string, unknown> | null,
    })
  }

  async findByUserId(
    userId: string,
    options?: {
      page?: number
      limit?: number
      status?: DiagnosisStatus
    },
  ): Promise<{ diagnoses: Diagnosis[]; total: number }> {
    const page = options?.page ?? 1
    const limit = options?.limit ?? 10
    const skip = (page - 1) * limit

    const where: any = { userId }

    if (options?.status) {
      where.status = options.status
    }

    const [diagnoses, total] = await Promise.all([
      prisma.diagnosis.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.diagnosis.count({ where }),
    ])

    return {
      diagnoses: diagnoses.map((d) =>
        Diagnosis.fromPersistence({
          ...d,
          rawResponse: d.rawResponse as Record<string, unknown> | null,
        }),
      ),
      total,
    }
  }

  async findByPlantId(plantId: string): Promise<Diagnosis[]> {
    const diagnoses = await prisma.diagnosis.findMany({
      where: { plantId },
      orderBy: { createdAt: 'desc' },
    })
    return diagnoses.map((d) =>
      Diagnosis.fromPersistence({
        ...d,
        rawResponse: d.rawResponse as Record<string, unknown> | null,
      }),
    )
  }

  async update(id: string, data: UpdateDiagnosisData): Promise<Diagnosis> {
    const diagnosis = await prisma.diagnosis.update({
      where: { id },
      data: {
        ...data,
        // Prisma expects JSON for rawResponse, but data.rawResponse is Record<string, unknown> which is compatible with JsonValue
        rawResponse: data.rawResponse as any,
      },
    })
    return Diagnosis.fromPersistence({
      ...diagnosis,
      rawResponse: diagnosis.rawResponse as Record<string, unknown> | null,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.diagnosis.delete({
      where: { id },
    })
  }

  async findPending(): Promise<Diagnosis[]> {
    const diagnoses = await prisma.diagnosis.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    })
    return diagnoses.map((d) =>
      Diagnosis.fromPersistence({
        ...d,
        rawResponse: d.rawResponse as Record<string, unknown> | null,
      }),
    )
  }
}
