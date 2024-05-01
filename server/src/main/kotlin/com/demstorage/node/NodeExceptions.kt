package com.demstorage.node

import com.demstorage.DemStorageException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

class NodeExceptions

@ResponseStatus(value = HttpStatus.CONFLICT)
class NodeIpDuplicatedException(
    override val message: String = "이미 등록된 IP 주소가 있어요"
) : DemStorageException(message)
