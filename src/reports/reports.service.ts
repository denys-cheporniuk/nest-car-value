import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './reports.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from '../users/users.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private repository: Repository<Report>,
  ) {}

  async create(values: CreateReportDto, user: User) {
    const report = await this.repository.create(values);
    report.user = user;

    return this.repository.save(report);
  }

  async changeApproval(id: number, approved: boolean) {
    const report = await this.repository.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Report with id ${id} not found`);
    }

    report.approved = approved;
    return this.repository.save(report);
  }
}
