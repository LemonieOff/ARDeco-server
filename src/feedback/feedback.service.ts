import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Feedback } from "./models/feedback.entity";

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback)
        private readonly feedbackRepository: Repository<Feedback>
    ) {
    }

    async all(): Promise<Feedback[]> {
        const all = await this.feedbackRepository.find();
        all.forEach(feedback => {
            delete feedback.user;
        });
        return all;
    }

    async allProcessed(): Promise<Feedback[]> {
        const all = await this.feedbackRepository.find({ where: { processed: true } });
        all.forEach(feedback => {
            delete feedback.user;
        });
        return all;
    }

    async allUnprocessed(): Promise<Feedback[]> {
        const all = await this.feedbackRepository.find({ where: { processed: false } });
        all.forEach(feedback => {
            delete feedback.user;
        });
        return all;
    }

    async findOne(id: number): Promise<Feedback> {
        return this.feedbackRepository.findOne({ where: { id: id } });
    }

    async create(data: Partial<Feedback>): Promise<Feedback> {
        const feedback = await this.feedbackRepository.save(data);
        delete feedback.user;
        console.log("Created feedback :", feedback);
        return feedback;
    }

    async process(id: number): Promise<Feedback> {
        const feedback = await this.feedbackRepository.findOne({ where: { id: id } });
        feedback.processed = true;
        feedback.processed_date = new Date();
        await this.feedbackRepository.save(feedback);
        delete feedback.user;
        console.log("Processed feedback :", feedback);
        return feedback;
    }

    async unprocess(id: number): Promise<Feedback> {
        const feedback = await this.feedbackRepository.findOne({ where: { id: id } });
        feedback.processed = false;
        feedback.processed_date = null;
        await this.feedbackRepository.save(feedback);
        delete feedback.user;
        console.log("Unprocessed feedback :", feedback);
        return feedback;
    }

    async delete(id: number) {
        console.log("Deleted feedback ", id);
        return this.feedbackRepository.delete(id);
    }
}
