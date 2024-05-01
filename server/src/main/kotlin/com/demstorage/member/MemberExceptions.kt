package com.demstorage.member

import com.demstorage.DemStorageException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(value = HttpStatus.CONFLICT)
class MemberIdDuplicationException(
    override val message: String = "이미 등록된 아이디가 있어요"
) : DemStorageException(message)

@ResponseStatus(value = HttpStatus.NOT_FOUND)
class MemberNotFoundException(
    override val message: String = "해당 회원을 찾을 수 없어요"
) : DemStorageException(message)
