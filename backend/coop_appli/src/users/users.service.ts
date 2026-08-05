import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByTelephone(telephone: string) {
    return this.prisma.user.findUnique({ where: { telephone } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findAll(role?: Role) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nom: true,
        prenom: true,
        telephone: true,
        email: true,
        role: true,
        actif: true,
        createdAt: true,
        // passwordHash volontairement exclu
      },
    });
  }

  // Annuaire des membres, accessible à tout utilisateur connecté (adhérent
  // ou admin). Volontairement limité à nom/prénom/téléphone : pas d'email,
  // pas de statut de compte, pas de rôle interne exposé aux autres membres.
  findAllMembers() {
    return this.prisma.user.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' },
      select: {
        id: true,
        nom: true,
        prenom: true,
        telephone: true,
        photoUrl: true,
      },
    });
  }

  deactivate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { actif: false },
    });
  }

  updateTelephone(id: string, telephone: string) {
    return this.prisma.user.update({
      where: { id },
      data: { telephone },
    });
  }

  updatePhoto(id: string, photoUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: { photoUrl },
    });
  }

  // Détail d'un membre pour la page profil membre. Le rôle n'est inclus
  // dans la réponse que si l'appelant est admin (voir controller) — un
  // adhérent ne doit pas savoir qui est admin ou non via cette route.
  findMemberById(id: string) {
    return this.prisma.user.findUnique({
      where: { id, actif: true },
      select: {
        id: true,
        nom: true,
        prenom: true,
        telephone: true,
        role: true,
        photoUrl: true,
      },
    });
  }

  createPendingAdherent(data: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
  }) {
    return this.prisma.user.create({
      data: {
        ...data,
        role: Role.ADHERENT,
        actif: false, // Activé uniquement après vérification du code OTP
      },
    });
  }

  activate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { actif: true },
    });
  }

  setPassword(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  // À appeler depuis un endpoint protégé (Roles.ADMIN) du futur module Admin.
  // Ne définit pas de mot de passe : l'utilisateur promu en définit un
  // lui-même via le flux setAdminPassword (voir AuthService).
  promoteToAdmin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { role: Role.ADMIN },
    });
  }

  // Réservé à la création de comptes admin (avec mot de passe), par un autre
  // admin via un endpoint protégé du futur module Admin. Les adhérents
  // passent par createPendingAdherent() + activate() (flux OTP).
  create(data: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    passwordHash: string;
    role?: Role;
  }) {
    return this.prisma.user.create({
      data: {
        ...data,
        // Le rôle est toujours ADHERENT à l'inscription : un admin ne peut
        // jamais être créé via l'inscription publique, seulement par un
        // autre admin via un endpoint protégé (à ajouter dans le module Admin).
        role: data.role ?? Role.ADHERENT,
      },
    });
  }

  // Création directe d'un nouvel admin par un admin existant. Pas de mot de
  // passe à ce stade : le nouvel admin le définit lui-même via le flux OTP
  // (voir AuthService.setAdminPassword).
  createAdmin(data: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
  }) {
    return this.prisma.user.create({
      data: {
        ...data,
        role: Role.ADMIN,
        actif: true,
      },
    });
  }
}
