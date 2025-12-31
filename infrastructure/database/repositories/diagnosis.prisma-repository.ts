import type {
  Diagnosis,
  DiagnosisProps,
  DiagnosisStatus,
} from '../../../domain/entities/diagnosis.entity.js'
import { Diagnosis as DiagnosisEntity } from '../../../domain/entities/diagnosis.entity.js'
import type {
  CreateDiagnosisData,
  DiagnosisRepository,
  UpdateDiagnosisData,
} from '../../../domain/repositories/diagnosis.repository.js'
import { prisma } from '../prisma.client.js'

export class DiagnosisPrismaRepository implements DiagnosisRepository {
  async create(data: CreateDiagnosisData): Promise<Diagnosis> {
    const diagnosis = await prisma.diagnosis.create({
      data: {
        imageUrl: data.imageUrl,
        description: data.description ?? null,
        plantId: data.plantId ?? null,
        userId: data.userId,
        status: 'PENDING',
      },
    })
    return this.mapToEntity(diagnosis)
  }

  async findById(id: string): Promise<Diagnosis | null> {
    const diagnosis = await prisma.diagnosis.findUnique({
      where: { id },
    })
    return diagnosis ? this.mapToEntity(diagnosis) : null
  }

  async findByUserId(
    userId: string,
    options?: { page?: number; limit?: number; status?: DiagnosisStatus },
  ): Promise<{ diagnoses: Diagnosis[]; total: number }> {
    const { page = 1, limit = 10, status } = options || {}
    const skip = (page - 1) * limit
    const where: any = { userId }
    if (status) where.status = status

    const [diagnoses, total] = await Promise.all([
      prisma.diagnosis.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        // Optimization: Exclude heavy text/json fields from list view
        select: {
          id: true,
          imageUrl: true,
          status: true,
          confidence: true,
          conditionName: true,
          conditionType: true,
          severity: true,
          plantId: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          // Excluded: description, symptoms, treatmentSteps, organicTreatment, chemicalTreatment, rawResponse
        },
      }),
      prisma.diagnosis.count({ where }),
    ])

    return {
      diagnoses: diagnoses.map(this.mapToEntity),
      total,
    }
  }

  async findByPlantId(plantId: string): Promise<Diagnosis[]> {
    const diagnoses = await prisma.diagnosis.findMany({
      where: { plantId },
      orderBy: { createdAt: 'desc' },
    })
    return diagnoses.map(this.mapToEntity)
  }

  async update(id: string, data: UpdateDiagnosisData): Promise<Diagnosis> {
    const diagnosis = await prisma.diagnosis.update({
      where: { id },
      data: {
        ...data,
      } as any,
    })
    return this.mapToEntity(diagnosis)
  }

  async delete(id: string): Promise<void> {
    await prisma.diagnosis.delete({ where: { id } })
  }

  async findPending(): Promise<Diagnosis[]> {
    const diagnoses = await prisma.diagnosis.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' }, // Process oldest first
    })
    return diagnoses.map(this.mapToEntity)
  }

  private mapToEntity(prismaDiagnosis: any): Diagnosis {
    const props: DiagnosisProps = {
      id: prismaDiagnosis.id,
      imageUrl: prismaDiagnosis.imageUrl,
      description: prismaDiagnosis.description ?? null,
      status: prismaDiagnosis.status,
      confidence: prismaDiagnosis.confidence ?? null,
      conditionName: prismaDiagnosis.conditionName ?? null,
      conditionType: prismaDiagnosis.conditionType ?? null,
      severity: prismaDiagnosis.severity ?? null,
      affectedParts: prismaDiagnosis.affectedParts ?? [],
      causes: prismaDiagnosis.causes ?? [],
      symptoms: prismaDiagnosis.symptoms ?? [],
      treatmentSteps: prismaDiagnosis.treatmentSteps ?? [],
      preventionTips: prismaDiagnosis.preventionTips ?? [],
      organicTreatment: prismaDiagnosis.organicTreatment ?? null,
      chemicalTreatment: prismaDiagnosis.chemicalTreatment ?? null,
      recoveryTimeWeeks: prismaDiagnosis.recoveryTimeWeeks ?? null,
      criticalActions: prismaDiagnosis.criticalActions ?? [],
      aiModel: prismaDiagnosis.aiModel ?? null,
      rawResponse: prismaDiagnosis.rawResponse ?? null,
      processingMs: prismaDiagnosis.processingMs ?? null,
      plantId: prismaDiagnosis.plantId ?? null,
      userId: prismaDiagnosis.userId,
      createdAt: prismaDiagnosis.createdAt,
      updatedAt: prismaDiagnosis.updatedAt,
    }
    return DiagnosisEntity.fromPersistence(props)
  }
}
