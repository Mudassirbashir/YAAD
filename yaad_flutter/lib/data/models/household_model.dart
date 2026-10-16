/// Household & Household Membership domain models matching
/// `public.households` and `public.household_members` tables.
library;

final class HouseholdModel {
  const HouseholdModel({
    required this.id,
    required this.name,
    required this.createdBy,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String name;
  final String createdBy;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory HouseholdModel.fromJson(Map<String, dynamic> json) {
    DateTime? parseDate(dynamic val) {
      if (val == null) return null;
      if (val is DateTime) return val;
      if (val is String) return DateTime.tryParse(val);
      if (val is int) return DateTime.fromMillisecondsSinceEpoch(val);
      return null;
    }

    return HouseholdModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      createdBy: json['created_by'] as String? ?? json['createdBy'] as String? ?? '',
      createdAt: parseDate(json['created_at'] ?? json['createdAt']),
      updatedAt: parseDate(json['updated_at'] ?? json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'created_by': createdBy,
      if (createdAt != null) 'created_at': createdAt!.toUtc().toIso8601String(),
      if (updatedAt != null) 'updated_at': updatedAt!.toUtc().toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is HouseholdModel && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'HouseholdModel(id: $id, name: $name, createdBy: $createdBy)';
}

enum HouseholdRole { owner, admin, member }

enum HouseholdMemberStatus { invited, accepted, rejected }

final class HouseholdMemberModel {
  const HouseholdMemberModel({
    required this.id,
    required this.householdId,
    required this.userId,
    this.role = HouseholdRole.member,
    this.status = HouseholdMemberStatus.accepted,
    this.userEmail,
    this.userName,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String householdId;
  final String userId;
  final HouseholdRole role;
  final HouseholdMemberStatus status;
  final String? userEmail;
  final String? userName;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory HouseholdMemberModel.fromJson(Map<String, dynamic> json) {
    DateTime? parseDate(dynamic val) {
      if (val == null) return null;
      if (val is DateTime) return val;
      if (val is String) return DateTime.tryParse(val);
      if (val is int) return DateTime.fromMillisecondsSinceEpoch(val);
      return null;
    }

    HouseholdRole parseRole(dynamic val) {
      final s = val?.toString().toLowerCase().trim();
      if (s == 'owner') return HouseholdRole.owner;
      if (s == 'admin') return HouseholdRole.admin;
      return HouseholdRole.member;
    }

    HouseholdMemberStatus parseStatus(dynamic val) {
      final s = val?.toString().toLowerCase().trim();
      if (s == 'invited') return HouseholdMemberStatus.invited;
      if (s == 'rejected') return HouseholdMemberStatus.rejected;
      return HouseholdMemberStatus.accepted;
    }

    return HouseholdMemberModel(
      id: json['id'] as String? ?? '',
      householdId: json['household_id'] as String? ?? json['householdId'] as String? ?? '',
      userId: json['user_id'] as String? ?? json['userId'] as String? ?? '',
      role: parseRole(json['role']),
      status: parseStatus(json['status']),
      userEmail: json['user_email'] as String? ?? json['userEmail'] as String?,
      userName: json['user_name'] as String? ?? json['userName'] as String?,
      createdAt: parseDate(json['created_at'] ?? json['createdAt']),
      updatedAt: parseDate(json['updated_at'] ?? json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'household_id': householdId,
      'user_id': userId,
      'role': role.name,
      'status': status.name,
      if (userEmail != null) 'user_email': userEmail,
      if (userName != null) 'user_name': userName,
      if (createdAt != null) 'created_at': createdAt!.toUtc().toIso8601String(),
      if (updatedAt != null) 'updated_at': updatedAt!.toUtc().toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is HouseholdMemberModel && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'HouseholdMemberModel(id: $id, userId: $userId, role: ${role.name})';
}
